
import { CheckCircle, Clock, ListTodo } from "lucide-react";
import { Header } from "@/components/header";
import { StatCard } from "@/components/stat-card";
import { BirthdayCard, BirthdayPerson } from "@/components/birthday-card";
import { UserTaskList } from "@/components/user-task-list";
import { Task } from "@/components/task-card";

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

// Exemplo de dados de tarefas
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Finalizar relatório mensal",
    description: "Concluir o relatório de vendas do mês de abril",
    status: "em-andamento",
    due_date: "2025-04-16",
    sector: "Comercial",
    created_by: "user1",
    priority: "alta",
  },
  {
    id: "2",
    title: "Reunião com fornecedores",
    description: "Discutir novos contratos e prazos",
    status: "pendente",
    due_date: "2025-04-18",
    sector: "Operacional",
    created_by: "user1",
    priority: "media",
  },
  {
    id: "3",
    title: "Atualizar planilha de controle",
    description: "Incluir novos clientes na planilha",
    status: "concluida",
    due_date: "2025-04-13",
    sector: "Financeiro",
    created_by: "user1",
    priority: "baixa",
  },
];

const Index = () => {
  // Estatísticas de tarefas
  const pendingTasks = mockTasks.filter(task => task.status === "pendente").length;
  const inProgressTasks = mockTasks.filter(task => task.status === "em-andamento").length;
  const completedTasks = mockTasks.filter(task => task.status === "concluida").length;

  // Manipuladores de eventos para as tarefas (seriam substituídos por chamadas reais à API)
  const handleAddTask = () => {
    console.log("Adicionar nova tarefa");
  };

  const handleEditTask = (task: Task) => {
    console.log("Editar tarefa", task);
  };

  const handleDeleteTask = (id: string) => {
    console.log("Excluir tarefa", id);
  };

  const handleStatusChange = (id: string, status: "pendente" | "em-andamento" | "concluida") => {
    console.log("Alterar status da tarefa", id, status);
  };

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
              value={pendingTasks}
              icon={Clock}
              iconColor="text-yellow-500"
            />
            <StatCard
              title="Tarefas em Andamento"
              value={inProgressTasks}
              icon={ListTodo}
              iconColor="text-blue-500"
            />
            <StatCard
              title="Tarefas Concluídas"
              value={completedTasks}
              icon={CheckCircle}
              iconColor="text-green-500"
            />
          </div>

          {/* Layout principal de duas colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna principal (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Minhas Tarefas</h2>
                <UserTaskList
                  tasks={mockTasks}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                  sectors={["Comercial", "Financeiro", "Operacional", "RH"]}
                />
              </div>
            </div>
            
            {/* Barra lateral (1/3) */}
            <div className="space-y-6">
              <BirthdayCard birthdays={birthdays} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
