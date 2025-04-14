
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BirthdayPerson {
  id: string;
  name: string;
  birthday: string;
  department?: string;
  age?: number;
  daysUntil?: number;
  isToday?: boolean;
}

interface BirthdayCardProps {
  birthdays: BirthdayPerson[];
  className?: string;
}

export function BirthdayCard({ birthdays, className }: BirthdayCardProps) {
  // Ordenar aniversários por proximidade
  const sortedBirthdays = [...birthdays].sort((a, b) => 
    (a.daysUntil || 0) - (b.daysUntil || 0)
  );

  const todayBirthdays = sortedBirthdays.filter(person => person.isToday);
  const upcomingBirthdays = sortedBirthdays.filter(person => !person.isToday);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Próximos Aniversários</CardTitle>
          <Gift className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {todayBirthdays.length > 0 && (
            <div className="bg-primary/10 p-4">
              <h4 className="font-medium text-sm mb-2">Hoje 🎉</h4>
              {todayBirthdays.map(person => (
                <div key={person.id} className="flex items-center justify-between py-1">
                  <div>
                    <span className="font-medium">{person.name}</span>
                    {person.department && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({person.department})
                      </span>
                    )}
                  </div>
                  {person.age && (
                    <span className="text-sm">{person.age} anos</span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="px-4 py-2">
            {upcomingBirthdays.length > 0 ? (
              upcomingBirthdays.map(person => (
                <div key={person.id} className="flex items-center justify-between py-2">
                  <div>
                    <span>{person.name}</span>
                    {person.department && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({person.department})
                      </span>
                    )}
                  </div>
                  <div className="text-sm">
                    <span>
                      {person.daysUntil === 1 
                        ? 'Amanhã' 
                        : `Em ${person.daysUntil} dias`}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-2 text-center text-muted-foreground">
                Nenhum aniversário próximo
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
