"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, Trash2, Recycle, Moon, Sun, X } from "lucide-react";
import { motion } from "framer-motion";

// Simple avatar generator
const Avatar = ({ room }) => {
  const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500"];
  const num = parseInt((room || "Room 1").split(" ")[1], 10) || 1;
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${colors[(num - 1) % colors.length]}`}>{num}</div>
  );
};

export default function TrashTimetable() {
  const rooms = ["Room 1", "Room 2", "Room 3", "Room 4", "Room 5", "Room 6"];
  const bins = ["Refuse Bin", "Recycle Bin"];

  const [darkMode, setDarkMode] = useState(false);
  const [userRoom, setUserRoom] = useState("");
  const [showSelector, setShowSelector] = useState(false);

  const getWeekNumber = () => {
    const today = new Date();
    const target = new Date(today.valueOf());
    const dayNr = (today.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThu = target.valueOf();
    const yearStart = new Date(target.getFullYear(), 0, 1);
    return 1 + Math.round((firstThu - yearStart) / (7 * 86400000));
  };

  const getAssignment = (week) => ({
    room: rooms[((week - 4) % rooms.length + rooms.length) % rooms.length],
    binType: bins[((week - 1) % bins.length + bins.length) % bins.length],
  });

  const getDateFromWeek = (year, week, day) => {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const start = new Date(simple);
    if (dow <= 4) start.setDate(simple.getDate() - dow + 1);
    else start.setDate(simple.getDate() + 8 - dow);
    const result = new Date(start);
    result.setDate(start.getDate() + day - 1);
    return result;
  };

  const generateSchedule = (weekNumber, weeksAhead = 7) => {
    const schedule = [];
    const year = new Date().getFullYear();
    for (let i = 0; i < weeksAhead; i++) {
      const w = weekNumber + i;
      const start = getDateFromWeek(year, w, 1);
      const end = getDateFromWeek(year, w, 7);
      const { room, binType } = getAssignment(w);
      schedule.push({
        week: w,
        start,
        end,
        room,
        bin: binType,
        dates: `${start.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} - ${end.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`,
      });
    }
    return schedule;
  };

  const weekNumber = getWeekNumber();
  const { room, binType } = getAssignment(weekNumber);
  const schedule = generateSchedule(weekNumber, 8);

  const today = new Date();
  const weekStart = getDateFromWeek(today.getFullYear(), weekNumber, 1);
  const progress = Math.max(0, Math.min(100, ((today - weekStart) / (7 * 86400000)) * 100));

  const downloadICS = () => {
    if (!showSelector) return setShowSelector(true);
    if (!userRoom) return alert("Select your room first.");

    const userWeeks = schedule.filter((s) => s.room === userRoom);
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\n";

    userWeeks.forEach((w) => {
      const dtStart = w.end.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      icsContent += `BEGIN:VEVENT\nSUMMARY:${w.bin} Duty\nDTSTART:${dtStart}\nEND:VEVENT\n`;
    });

    icsContent += "END:VCALENDAR";
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TrashDuty_${userRoom}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setShowSelector(false);
  };

  const darkCard = darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black";
  const darkTextSecondary = darkMode ? "text-gray-300" : "text-gray-500";
  const darkBorder = darkMode ? "border-gray-700" : "border-gray-200";

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} min-h-screen p-6 flex flex-col items-center transition`}>
      <div className="w-full max-w-3xl flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">🗑️ Trash Timetable</h1>
        <Button variant="outline" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun /> : <Moon />}
        </Button>
      </div>

      {showSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <Card className={`w-full max-w-md ${darkCard} ${darkBorder}`}>
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Export to Calendar</h3>
                <Button variant="ghost" onClick={() => setShowSelector(false)}>
                  <X />
                </Button>
              </div>

              <p className="font-semibold mb-2">Select Your Room:</p>
              <select className={`w-full p-2 rounded-lg ${darkMode ? "bg-gray-700 text-white" : "bg-white"}`} onChange={(e) => setUserRoom(e.target.value)} value={userRoom}>
                <option value="">Choose...</option>
                {rooms.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <div className="mt-4 flex gap-3">
                <Button onClick={downloadICS} className="flex-1">Download .ics</Button>
                <Button variant="outline" onClick={() => setShowSelector(false)} className="flex-1">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className={`w-full max-w-2xl mb-6 ${darkCard} ${darkBorder}`}>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 text-xl font-semibold mb-2">
            <AlertCircle /> Reminder
          </div>

          <p>
            {room} please don't forget to empty out the kitchen refuse bin, and take out the <strong>{binType}</strong> by Sunday.
          </p>

          <div className={`${darkMode ? "bg-gray-700" : "bg-gray-300"} w-full h-3 rounded-full mt-4 overflow-hidden`}>
            <motion.div className="h-3 bg-green-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }} />
          </div>

          <p className={`text-sm mt-1 ${darkTextSecondary}`}>{Math.round(progress)}% of the week passed</p>
        </CardContent>
      </Card>

      <Card className={`w-full max-w-3xl ${darkCard} ${darkBorder}`}>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 text-xl font-semibold mb-4"><Calendar /> Upcoming Schedule</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedule.map((item, index) => (
              <motion.div key={index} className={`p-4 rounded-xl border shadow-sm ${darkCard} ${darkBorder}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <div className="flex items-center gap-3 mb-2">
                  <Avatar room={item.room} />
                  <div>
                    <div className="font-semibold">{item.room}</div>
                    <div className={`text-sm ${darkTextSecondary}`}>{item.dates}</div>
                  </div>
                </div>

                <div className={`flex items-center gap-2 ${darkTextSecondary}`}>
                  Bin: <strong>{item.bin}</strong>
                  {item.bin.includes("Recycle") ? <Recycle size={16} /> : <Trash2 size={16} />}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="w-full max-w-3xl flex gap-4 mt-6">
        <Button className="w-full" onClick={downloadICS}>Export to Calendar</Button>
      </div>

    </div>
  );
}