
import { CheckCircle, Clock, ListTodo } from "lucide-react";
import { Header } from "@/components/header";
import { StatCard } from "@/components/stat-card";
import { BirthdayCard, BirthdayPerson } from "@/components/birthday-card";

const currentUser = {
  name: "João Silva",
  email: "joao.silva@aluguetudo.com",
  role: ["admin"],
};

// Exemplo de dados de aniversariantes
const birthdays: BirthdayPerson[] = [
  {
    id: "1",
    name: "Maria Oliveira",
    birthday: "1990-04-16",
    department: "RH",
    age: 34,
    daysUntil: 2,
    isToday: false,
  },
  {
    id: "2",
    name: "Carlos Santos",
    birthday: "1985-04-14",
    department: "Comercial",
    age: 39,
    daysUntil: 0,
    isToday: true,
  },
  {
    id: "3",
    name: "Ana Luiza",
    birthday: "1992-04-18",
    department: "Financeiro",
    age: 32,
    daysUntil: 4,
    isToday: false,
  },
  {
    id: "4",
    name: "Pedro Henrique",
    birthday: "1988-04-15",
    department: "Operacional",
    age: 36,
    daysUntil: 1,
    isToday: false,
  },
];

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header user={currentUser} />
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Olá, {currentUser.name}</h1>
            <p className="text-muted-foreground">
              Bem-vindo ao seu dashboard. Veja o resumo de suas atividades.
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Tarefas Pendentes"
              value={0}
              icon={Clock}
              iconColor="text-yellow-500"
            />
            <StatCard
              title="Tarefas em Andamento"
              value={0}
              icon={ListTodo}
              iconColor="text-blue-500"
            />
            <StatCard
              title="Tarefas Concluídas"
              value={0}
              icon={CheckCircle}
              iconColor="text-green-500"
            />
          </div>
          
          {/* Barra lateral (1/3) */}
          <div className="space-y-6">
            <BirthdayCard birthdays={birthdays} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
