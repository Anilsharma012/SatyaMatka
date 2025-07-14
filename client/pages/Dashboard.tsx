import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LogOut,
  User,
  Wallet,
  Trophy,
  Clock,
  TrendingUp,
  MessageSquare,
  Target,
  RefreshCw,
  Play,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react";

interface WalletData {
  balance: number;
  winningBalance: number;
  depositBalance: number;
  bonusBalance: number;
  commissionBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalWinnings: number;
  totalBets: number;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem("matka_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("/api/wallet/balance", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setWalletData(data.data);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const matkaGames = [
    {
      name: "Matka Games",
      icon: Play,
      color: "from-blue-500 to-blue-600",
      description: "Play Delhi Bazar, Gali, Disawer and more",
      route: "/matka-games",
    },
  ];

  return (
    <div className="min-h-screen bg-matka-dark">
      {/* Fully Responsive Professional Header */}
      <header className="bg-card/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-matka-gold via-yellow-500 to-matka-gold-dark flex items-center justify-center shadow-lg">
                <span className="text-sm sm:text-lg lg:text-xl">🏺</span>
              </div>
              <div>
                <h1 className="text-matka-gold font-bold text-lg sm:text-xl lg:text-2xl">
                  Matka Hub
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm hidden sm:block">
                  Welcome back,{" "}
                  <span className="font-medium">{user?.fullName}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
              <Button
                onClick={fetchWalletData}
                variant="outline"
                size="sm"
                disabled={loading}
                className="border-matka-gold/30 text-matka-gold hover:bg-matka-gold/10 text-xs sm:text-sm px-2 sm:px-3"
              >
                <RefreshCw
                  className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${loading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-600 hover:bg-red-50 text-xs sm:text-sm px-2 sm:px-3"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Fully Responsive Professional Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-12">
          <Card className="bg-card/95 backdrop-blur-md border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-matka-gold to-yellow-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <Wallet className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                    Deposit Balance
                  </p>
                  <div className="text-foreground font-bold text-lg sm:text-xl lg:text-2xl truncate">
                    {loading ? (
                      <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-matka-gold border-t-transparent rounded-full"></div>
                    ) : (
                      `₹${walletData?.depositBalance?.toLocaleString() || 0}`
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-md border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                    Winning Balance
                  </p>
                  <div className="text-foreground font-bold text-lg sm:text-xl lg:text-2xl truncate">
                    {loading ? (
                      <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-green-500 border-t-transparent rounded-full"></div>
                    ) : (
                      `₹${walletData?.winningBalance?.toLocaleString() || 0}`
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-md border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                    Total Balance
                  </p>
                  <div className="text-foreground font-bold text-lg sm:text-xl lg:text-2xl truncate">
                    {loading ? (
                      <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    ) : (
                      `₹${walletData?.balance?.toLocaleString() || 0}`
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fully Responsive Matka Games Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-foreground text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <Play className="h-5 w-5 sm:h-6 sm:w-6 text-matka-gold" />
            🎯 Matka Games
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {matkaGames.map((game, index) => {
              const IconComponent = game.icon;
              return (
                <Card
                  key={index}
                  onClick={() => navigate(game.route)}
                  className="bg-card/90 backdrop-blur-sm border-border/50 hover:border-matka-gold/50 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:scale-[1.02]"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
                      <div
                        className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${game.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                      >
                        <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-foreground font-bold text-lg sm:text-xl">
                          {game.name}
                        </h3>
                        <p className="text-muted-foreground text-sm sm:text-base">
                          {game.description}
                        </p>
                      </div>
                      <Button
                        size="lg"
                        className="w-full sm:w-auto bg-gradient-to-r from-matka-gold to-yellow-500 text-matka-dark font-bold hover:from-yellow-500 hover:to-matka-gold transition-all duration-300 shadow-md px-6 sm:px-8"
                      >
                        Play Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Fully Responsive Recent Game Results */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-foreground text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-matka-gold" />
            🧩 Recent Game Results
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card
              onClick={() => navigate("/game-results/delhi-bazar")}
              className="bg-card/90 backdrop-blur-sm border-border/50 hover:border-matka-gold/50 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="text-foreground font-semibold text-sm sm:text-base">
                    Delhi Bazaar
                  </h3>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm sm:text-lg">
                      5
                    </span>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <p>
                    Result: <span className="text-matka-gold font-mono">5</span>
                  </p>
                  <p>Declared: Today 3:15 PM</p>
                  <p className="text-green-600">✅ Result Available</p>
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => navigate("/game-results/goa-market")}
              className="bg-card/90 backdrop-blur-sm border-border/50 hover:border-matka-gold/50 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="text-foreground font-semibold text-sm sm:text-base">
                    Goa Market
                  </h3>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-400 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <p>
                    Result: <span className="text-yellow-600">Pending</span>
                  </p>
                  <p>Expected: Tomorrow 4:30 PM</p>
                  <p className="text-yellow-600">⏳ 16h remaining</p>
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => navigate("/game-results/disawer")}
              className="bg-card/90 backdrop-blur-sm border-border/50 hover:border-matka-gold/50 transition-all duration-300 cursor-pointer hover:scale-[1.02] sm:col-span-2 lg:col-span-1"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="text-foreground font-semibold text-sm sm:text-base flex items-center gap-1">
                    🎯 Disawer
                  </h3>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm sm:text-lg">
                      3
                    </span>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <p>
                    Result: <span className="text-matka-gold font-mono">3</span>
                  </p>
                  <p>Declared: Today 6:00 AM</p>
                  <p className="text-green-600">✅ Result Available</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Fully Responsive Professional Quick Actions */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-foreground text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-matka-gold" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              {
                name: "Add Money",
                route: "/add-money",
                icon: Wallet,
                color: "from-green-500 to-green-600",
              },
              {
                name: "Withdraw",
                route: "/withdraw",
                icon: TrendingUp,
                color: "from-blue-500 to-blue-600",
              },
              {
                name: "My Bets",
                route: "/my-bets",
                icon: Target,
                color: "from-purple-500 to-purple-600",
              },
              {
                name: "Wallet",
                route: "/wallet",
                icon: User,
                color: "from-orange-500 to-orange-600",
              },
              {
                name: "Analytics",
                route: "/analytics",
                icon: BarChart3,
                color: "from-red-500 to-red-600",
              },
              {
                name: "Support",
                route: "/support",
                icon: HelpCircle,
                color: "from-pink-500 to-pink-600",
              },
            ].map((action, index) => (
              <Card
                key={index}
                onClick={() => navigate(action.route)}
                className="bg-card/90 backdrop-blur-sm border-border/50 hover:border-matka-gold/50 transition-all duration-300 cursor-pointer group hover:shadow-md hover:scale-[1.02]"
              >
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${action.color} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <action.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <p className="text-foreground font-medium text-xs sm:text-sm">
                      {action.name}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
