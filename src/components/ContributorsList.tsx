
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type Contributor = {
  id: number;
  name: string;
  role: string;
  avatarUrl?: string;
};

const contributors: Contributor[] = [
  {
    id: 1,
    name: "أحمد عبده",
    role: "مطور التطبيق",
    avatarUrl: "/lovable-uploads/f39108e3-15cc-458c-bb92-7e6b18e100cc.png",
  },
  {
    id: 2,
    name: "سارة محمد",
    role: "مصممة واجهة المستخدم",
  },
  {
    id: 3,
    name: "محمد خالد",
    role: "مستشار المحتوى",
  },
  {
    id: 4,
    name: "نورا أحمد",
    role: "مختبرة التطبيق",
  },
];

export const ContributorsList = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-right">لائحة الشكر</CardTitle>
          <CardDescription className="text-right">
            نود أن نشكر جميع المساهمين الذين ساعدوا في تطوير تطبيق "ممتن"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contributors.map((contributor) => (
              <div
                key={contributor.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarImage src={contributor.avatarUrl} alt={contributor.name} />
                  <AvatarFallback className="text-xl">
                    {contributor.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <h3 className="font-bold text-lg">{contributor.name}</h3>
                  <p className="text-gray-600">{contributor.role}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
