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
    avatarUrl: "/musin-logo.png",
  },
];

export const ContributorsList = () => {
  const filteredContributors = contributors.filter(c => c.name === "أحمد عبده");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-right">لائحة الشكر</CardTitle>
          <CardDescription className="text-right">
            المساهمون في تطوير تطبيق "ممتن"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredContributors.map((contributor) => (
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
                  <h3 className="font-bold text-lg text-purple-600">{contributor.name}</h3>
                  <p className="text-gray-600">{contributor.role}</p>
                  <a 
                    href="https://ahmedabdo.net" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-purple-500 hover:underline text-sm"
                  >
                    AhmedAbdo.net
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 text-right">
            <p className="text-lg font-semibold mb-2 text-white">إهداء خاص</p>
            <p className="text-white/80">هذا التطبيق <span className="font-bold text-purple-300">إهداء إلى أولائك الذين امتننت لوجودهم في حياتي</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
