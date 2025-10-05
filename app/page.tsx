"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Utensils, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

type MealType = "Breakfast" | "Lunch" | "Dinner";

interface MenuData {
  Date: string;
  Day: string;
  Breakfast: string;
  Lunch: string;
  Dinner: string;
}

const getFoodEmoji = (item: string): string => {
  const lowerItem = item.toLowerCase();
  if (
    lowerItem.includes("dosa") ||
    lowerItem.includes("idly") ||
    lowerItem.includes("idli")
  )
    return "🥞";
  if (lowerItem.includes("rice")) return "🍚";
  if (lowerItem.includes("chapatti") || lowerItem.includes("roti")) return "🫓";
  if (lowerItem.includes("sambar")) return "🍲";
  if (lowerItem.includes("rasam")) return "🥣";
  if (lowerItem.includes("curd") || lowerItem.includes("yogurt")) return "🥛";
  if (lowerItem.includes("coffee")) return "☕";
  if (lowerItem.includes("tea")) return "🍵";
  if (lowerItem.includes("milk")) return "🥛";
  if (lowerItem.includes("egg")) return "🥚";
  if (lowerItem.includes("chutney")) return "🥗";
  if (lowerItem.includes("podi")) return "🌶️";
  if (lowerItem.includes("payasam") || lowerItem.includes("sweet")) return "🍮";
  if (lowerItem.includes("buttermilk")) return "🥤";
  if (lowerItem.includes("salad")) return "🥗";
  if (lowerItem.includes("raita")) return "🥙";
  if (lowerItem.includes("ghee")) return "🧈";
  if (lowerItem.includes("jam")) return "🍯";
  if (lowerItem.includes("poriyal") || lowerItem.includes("vegetable"))
    return "🥬";
  if (lowerItem.includes("kuruma") || lowerItem.includes("curry")) return "🍛";
  return "🍽️";
};

export default function BitMessPage() {
  const [messType, setMessType] = useState<"Boys" | "Girls">("Boys");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentMeal, setCurrentMeal] = useState<MealType>("Breakfast");
  const [servingStatus, setServingStatus] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Determine current meal based on time
  useEffect(() => {
    const updateCurrentMeal = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeInMinutes = hours * 60 + minutes;

      // 7:00 AM - 8:30 AM (420-510 minutes)
      if (timeInMinutes >= 420 && timeInMinutes <= 510) {
        setCurrentMeal("Breakfast");
        setServingStatus("Breakfast is now serving");
      }
      // 12:30 PM - 1:00 PM (750-780 minutes)
      else if (timeInMinutes >= 750 && timeInMinutes <= 810) {
        setCurrentMeal("Lunch");
        setServingStatus("Lunch is now serving");
      }
      // 4:25 PM - 5:30 PM (1065-1110 minutes)
      else if (timeInMinutes >= 1065 && timeInMinutes <= 1110) {
        setServingStatus("Tea, Coffee and Milk is serving");
        // Show dinner menu during tea time
        setCurrentMeal("Dinner");
      }
      // 7:00 PM - 8:30 PM (1140-1230 minutes)
      else if (timeInMinutes >= 1140 && timeInMinutes <= 1230) {
        setCurrentMeal("Dinner");
        setServingStatus("Dinner is now serving");
      }
      // Before breakfast
      else if (timeInMinutes < 420) {
        setCurrentMeal("Breakfast");
        setServingStatus("");
      }
      // Between breakfast and lunch
      else if (timeInMinutes > 510 && timeInMinutes < 750) {
        setCurrentMeal("Lunch");
        setServingStatus("");
      }
      // After dinner
      else {
        setCurrentMeal("Breakfast");
        setServingStatus("");
      }
    };

    updateCurrentMeal();
    const interval = setInterval(updateCurrentMeal, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Fetch menu data
  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const formattedDate = formatDateForAPI(selectedDate);
        const response = await fetch(
          `https://script.google.com/macros/s/AKfycbwh2D37lmpbH-L3gYS78byyhWF-LXVqyPSIRfbp9MlsGFFuZ3LQBMqQOSYSw0C8fzWJ/exec?sheet=${messType}&date=${formattedDate}`
        );
        const data = await response.json();
        if (data.rows && data.rows.length > 0) {
          setMenuData(data.rows[0]);
        }
      } catch (error) {
        console.error("[v0] Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [messType, selectedDate]);

  const formatDateForAPI = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  const splitMenuItems = (menuString: string): string[] => {
    if (!menuString) return [];
    return menuString
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const getMealIcon = (meal: MealType) => {
    switch (meal) {
      case "Breakfast":
        return <Sun className="h-5 w-5" />;
      case "Lunch":
        return <Utensils className="h-5 w-5" />;
      case "Dinner":
        return <Moon className="h-5 w-5" />;
    }
  };

  const getMealEmoji = (meal: MealType) => {
    switch (meal) {
      case "Breakfast":
        return "🌅";
      case "Lunch":
        return "🍱";
      case "Dinner":
        return "🌙";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="border-b border-border bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 sticky top-0 z-50 shadow-lg backdrop-blur-sm">
        <div className="container mx-auto px-3 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl sm:text-4xl font-bold text-primary text-center flex-1">
                🍽️ BitMess 🍽️
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="h-10 w-10 rounded-full"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="flex gap-2 w-full">
              <Button
                variant={messType === "Boys" ? "default" : "outline"}
                onClick={() => setMessType("Boys")}
                className="font-semibold flex-1 h-12 text-base"
              >
                👨 Boys Mess
              </Button>
              <Button
                variant={messType === "Girls" ? "default" : "outline"}
                onClick={() => setMessType("Girls")}
                className="font-semibold flex-1 h-12 text-base"
              >
                👩 Girls Mess
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 py-4 max-w-2xl">
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground bg-card p-3 rounded-lg border">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-center">
              {format(new Date(), "EEEE, MMM d, yyyy • h:mm a")}
            </span>
          </div>

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 h-12 text-base w-full bg-card"
              >
                <Calendar className="h-5 w-5" />
                📅 {format(selectedDate, "dd-MM-yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-card/95 backdrop-blur-xl border-2 shadow-2xl"
              align="center"
            >
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setCalendarOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {servingStatus && (
          <Card className="mb-4 bg-gradient-to-r from-primary to-secondary p-4 text-center border-0 shadow-lg">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-2xl animate-bounce">🔔</span>
              <p className="text-lg sm:text-xl font-bold text-primary-foreground">
                {servingStatus}
              </p>
              <span className="text-2xl animate-bounce">🔔</span>
            </div>
          </Card>
        )}

        {/* Menu Display */}
        {loading ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="text-5xl animate-spin">🍳</div>
              <p className="text-muted-foreground font-medium">
                Loading delicious menu...
              </p>
            </div>
          </Card>
        ) : menuData ? (
          <Tabs
            value={currentMeal}
            onValueChange={(v) => setCurrentMeal(v as MealType)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-4 h-auto p-1 bg-card">
              <TabsTrigger
                value="Breakfast"
                className="flex-col gap-1 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="text-2xl">{getMealEmoji("Breakfast")}</span>
                <span className="font-semibold text-xs sm:text-sm">
                  Breakfast
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="Lunch"
                className="flex-col gap-1 py-3 px-2 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
              >
                <span className="text-2xl">{getMealEmoji("Lunch")}</span>
                <span className="font-semibold text-xs sm:text-sm">Lunch</span>
              </TabsTrigger>
              <TabsTrigger
                value="Dinner"
                className="flex-col gap-1 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="text-2xl">{getMealEmoji("Dinner")}</span>
                <span className="font-semibold text-xs sm:text-sm">Dinner</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="Breakfast">
              <Card className="p-4 sm:p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                  <div className="text-4xl">{getMealEmoji("Breakfast")}</div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                      Breakfast
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      ⏰ 7:00 AM - 8:30 AM
                    </p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {splitMenuItems(menuData.Breakfast).map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-foreground bg-accent/30 p-3 rounded-lg"
                    >
                      <span className="text-xl flex-shrink-0">
                        {getFoodEmoji(item)}
                      </span>
                      <span className="text-sm sm:text-base leading-relaxed font-medium">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </TabsContent>

            <TabsContent value="Lunch">
              <Card className="p-4 sm:p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                  <div className="text-4xl">{getMealEmoji("Lunch")}</div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                      Lunch
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      ⏰ 12:30 PM - 1:30 PM
                    </p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {splitMenuItems(menuData.Lunch).map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-foreground bg-secondary/20 p-3 rounded-lg"
                    >
                      <span className="text-xl flex-shrink-0">
                        {getFoodEmoji(item)}
                      </span>
                      <span className="text-sm sm:text-base leading-relaxed font-medium">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </TabsContent>

            <TabsContent value="Dinner">
              <Card className="p-4 sm:p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                  <div className="text-4xl">{getMealEmoji("Dinner")}</div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                      Dinner
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      ⏰ 7:00 PM - 8:30 PM
                    </p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {splitMenuItems(menuData.Dinner).map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-foreground bg-primary/20 p-3 rounded-lg"
                    >
                      <span className="text-xl flex-shrink-0">
                        {getFoodEmoji(item)}
                      </span>
                      <span className="text-sm sm:text-base leading-relaxed font-medium">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="p-8 text-center">
            <div className="text-5xl mb-3">😔</div>
            <p className="text-muted-foreground text-base font-medium">
              No menu available for this date
            </p>
          </Card>
        )}

        <Card className="mt-4 p-4 bg-gradient-to-r from-accent/30 to-secondary/30 border-2 border-dashed border-primary/30">
          <div className="flex items-center gap-2 justify-center text-foreground flex-wrap">
            <span className="text-2xl">☕</span>
            <p className="text-sm sm:text-base font-semibold text-center">
              Tea, Coffee & Milk: 4:25 PM - 5:30 PM
            </p>
            <span className="text-2xl">🍵</span>
          </div>
        </Card>
      </main>
    </div>
  );
}
