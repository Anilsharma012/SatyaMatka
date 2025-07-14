import express from "express";
import mongoose from "mongoose";
import Game from "../models/Game";
import Bet from "../models/Bet";
import User from "../models/User";
import auth from "../middleware/auth";
import { adminAuth, AdminRequest } from "../middleware/adminAuth";

const router = express.Router();

// 🧩 Unified Result Declaration System API Endpoints

/**
 * @route POST /api/results/declare/:gameId
 * @desc Manually declare result for a game
 * @access Admin only
 */
router.post("/declare/:gameId", adminAuth, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { declaredResult } = req.body;
    const adminId = (req as AdminRequest).admin?._id;

    // Validate input
    if (!declaredResult || typeof declaredResult !== "string") {
      return res.status(400).json({
        success: false,
        message: "Declared result is required and must be a string",
      });
    }

    // Validate game exists and is in correct status

    const game = await Game.findById(gameId).select("name").lean();
    const gameName = (game as any)?.name || "N/A";

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    if (game.declaredResult) {
      return res.status(400).json({
        success: false,
        message: "Result already declared for this game",
      });
    }

    if (game.currentStatus !== "closed") {
      return res.status(400).json({
        success: false,
        message: "Can only declare result for closed games",
      });
    }

    // Update game with declared result
    const now = new Date();
    await Game.findByIdAndUpdate(gameId, {
      declaredResult: declaredResult.trim(),
      resultDeclaredAt: now,
      resultDeclaredBy: adminId,
      resultMethod: "manual",
      currentStatus: "result_declared",
      isResultPending: false,
      lastResultDate: now,
      lastStatusChange: now,
    });

    // Process all bets for this game and determine winners/losers
    const processedBets = await processBetsForResult(
      gameId,
      declaredResult.trim(),
    );

    console.log(`🎯 Result declared for game ${gameName}: ${declaredResult}`);

    console.log(
      `📊 Processed ${processedBets.totalBets} bets: ${processedBets.winningBets} wins, ${processedBets.losingBets} losses`,
    );

    res.json({
      success: true,
      message: "Result declared successfully",
      data: {
        gameId,
        gameName: gameName,
        declaredResult: declaredResult.trim(),
        resultDeclaredAt: now,
        method: "manual",
        processedBets,
      },
    });
  } catch (error: any) {
    console.error("❌ Error declaring result:", error);
    res.status(500).json({
      success: false,
      message: "Failed to declare result",
      error: error.message,
    });
  }
});

/**
 * @route GET /api/results/pending
 * @desc Get all games pending result declaration
 * @access Admin only
 */
router.get("/pending", adminAuth, async (req, res) => {
  try {
    const now = new Date();

    // Find games that are closed but don't have results declared yet
    const pendingGames = await Game.find({
      currentStatus: "closed",
      declaredResult: { $exists: false },
      isActive: true,
    })
      .populate("createdBy", "name email")
      .sort({ endTime: 1 });

    // Add auto-schedule information
    const gamesWithSchedule = pendingGames.map((game) => {
      const gameObj = game.toObject();

      // Calculate when auto result should be declared (24 hours after end time)
      const today = new Date();
      const [hours, minutes] = game.endTime.split(":").map(Number);
      const endDateTime = new Date(today);
      endDateTime.setHours(hours, minutes, 0, 0);

      // If end time has passed today, it ended today
      // Auto result should be declared 24 hours later
      const autoScheduleTime = new Date(
        endDateTime.getTime() + 24 * 60 * 60 * 1000,
      );

      return {
        ...gameObj,
        autoResultScheduled: autoScheduleTime,
        hoursUntilAutoResult: Math.max(
          0,
          Math.ceil(
            (autoScheduleTime.getTime() - now.getTime()) / (1000 * 60 * 60),
          ),
        ),
        isOverdue: now > autoScheduleTime,
      };
    });

    res.json({
      success: true,
      data: {
        pendingGames: gamesWithSchedule,
        totalPending: gamesWithSchedule.length,
        overdueCount: gamesWithSchedule.filter((g) => g.isOverdue).length,
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching pending results:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending results",
      error: error.message,
    });
  }
});

/**
 * @route GET /api/results/history
 * @desc Get result declaration history
 * @access Admin only
 */
router.get("/history", adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const resultsHistory = await Game.find({
      declaredResult: { $exists: true, $ne: null },
    })
      .populate("createdBy resultDeclaredBy", "name email")
      .sort({ resultDeclaredAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Game.countDocuments({
      declaredResult: { $exists: true, $ne: null },
    });

    res.json({
      success: true,
      data: {
        results: resultsHistory,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalResults: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching results history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch results history",
      error: error.message,
    });
  }
});

/**
 * @route GET /api/results/game/:gameId
 * @desc Get result for a specific game
 * @access Public (for users to see results)
 */
router.get("/game/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findById(gameId)
      .populate("resultDeclaredBy", "name")
      .select("name declaredResult resultDeclaredAt resultMethod currentStatus")
      .lean();

    const gameName = (game as any)?.name || "N/A";

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    if (!game.declaredResult) {
      return res.json({
        success: true,
        data: {
          gameId,
          gameName: game.name,

          status: game.currentStatus,
          resultDeclared: false,
          message: "Result not yet declared",
        },
      });
    }

    res.json({
      success: true,
      data: {
        gameId,
        gameName: game.name,

        declaredResult: game.declaredResult,
        resultDeclaredAt: game.resultDeclaredAt,
        resultMethod: game.resultMethod,
        resultDeclaredBy: (game.resultDeclaredBy as any)?.name || "System",
        status: game.currentStatus,
        resultDeclared: true,
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching game result:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch game result",
      error: error.message,
    });
  }
});

/**
 * @route GET /api/results/user-bets/:gameId
 * @desc Get user's bet results for a game
 * @access Protected (logged in users)
 */
router.get("/user-bets/:gameId", auth, async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = (req as any).user._id;

    const game = await Game.findById(gameId)
      .select("name declaredResult resultDeclaredAt")
      .lean();

    const gameName = (game as any)?.name || "N/A";

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    // Get user's bets for this game
    const userBets = await Bet.find({
      gameId,
      userId,
    }).sort({ createdAt: -1 });

    // Calculate win/loss status if result is declared
    const betsWithResults = userBets.map((bet) => {
      const betObj = bet.toObject();

      if (game.declaredResult) {
        const isWinning = checkBetWinning(bet, game.declaredResult);
        return {
          ...betObj,
          isWinning,
          declaredResult: game.declaredResult,
          resultDeclaredAt: game.resultDeclaredAt,
        };
      }

      return {
        ...betObj,
        isWinning: null,
        declaredResult: null,
        resultDeclaredAt: null,
      };
    });

    const winningBets = betsWithResults.filter((bet) => bet.isWinning === true);
    const losingBets = betsWithResults.filter((bet) => bet.isWinning === false);
    const totalWinAmount = winningBets.reduce(
      (sum, bet) => sum + (bet.potentialWinning || 0),
      0,
    );

    res.json({
      success: true,
      data: {
        gameName: gameName,
        declaredResult: game.declaredResult,
        resultDeclaredAt: game.resultDeclaredAt,
        userBets: betsWithResults,
        summary: {
          totalBets: userBets.length,
          winningBets: winningBets.length,
          losingBets: losingBets.length,
          totalWinAmount,
          resultDeclared: !!game.declaredResult,
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching user bet results:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user bet results",
      error: error.message,
    });
  }
});

// 🔧 Helper Functions

/**
 * Process all bets for a game when result is declared
 */
async function processBetsForResult(gameId: string, declaredResult: string) {
  try {
    const bets = await Bet.find({ gameId }).populate("userId", "name email");

    let winningBets = 0;
    let losingBets = 0;
    let totalWinAmount = 0;

    for (const bet of bets) {
      const isWinning = checkBetWinning(bet, declaredResult);

      // Update bet with result
      await Bet.findByIdAndUpdate(bet._id, {
        isWinning,
        resultDeclared: true,
        resultDeclaredAt: new Date(),
        declaredResult,
      });

      if (isWinning) {
        winningBets++;
        totalWinAmount += bet.potentialWinning || 0;

        // Add winning amount to user's wallet
        await User.findByIdAndUpdate(bet.userId, {
          $inc: {
            winningBalance: bet.potentialWinning || 0,
            totalWinnings: bet.potentialWinning || 0,
          },
        });
      } else {
        losingBets++;
      }
    }

    console.log(
      `📊 Processed ${bets.length} bets for game ${gameId}: ${winningBets} wins, ${losingBets} losses, ₹${totalWinAmount} total winnings`,
    );

    return {
      totalBets: bets.length,
      winningBets,
      losingBets,
      totalWinAmount,
    };
  } catch (error) {
    console.error("❌ Error processing bets:", error);
    throw error;
  }
}

/**
 * Check if a bet is winning based on declared result
 */
function checkBetWinning(bet: any, declaredResult: string): boolean {
  switch (bet.betType) {
    case "jodi":
      // For Jodi: exact match with bet number
      return bet.betNumber === declaredResult;

    case "haruf":
      // For Haruf: check if declared result contains the bet digit in correct position
      if (bet.harufPosition === "first" || bet.harufPosition === "start") {
        return declaredResult.charAt(0) === bet.betNumber;
      } else if (bet.harufPosition === "last" || bet.harufPosition === "end") {
        return (
          declaredResult.charAt(declaredResult.length - 1) === bet.betNumber
        );
      }
      // Default: check if digit appears anywhere
      return declaredResult.includes(bet.betNumber);

    case "crossing":
      // For Crossing: check if any of the crossing combinations match
      if (bet.crossingCombinations && Array.isArray(bet.crossingCombinations)) {
        return bet.crossingCombinations.some(
          (combo: any) => combo.number === declaredResult,
        );
      }
      // Fallback: direct match
      return bet.betNumber === declaredResult;

    default:
      return false;
  }
}

export default router;
