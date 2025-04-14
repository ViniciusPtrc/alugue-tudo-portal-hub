
import { useState } from "react";
import { Header } from "@/components/header";
import { UserTaskList } from "@/components/user-task-list";
import { Task, TaskStatus } from "@/components/task-card";

const currentUser = {
  name: "João Silva",
  email: "joao.silva@aluguetudo.com",
  role: ["admin"],
};

// Exemplo de dados de tarefas pessoais
const mockPersonalTasks: Task[] = [
  {
    id: "1",
    title: "Preparar apresentação para reunião",
    description: "Slides sobre os novos projetos",
    status: "pendente",
    due_date: "2025-04-20",
    created_by: "user1",
    priority: "alta",
  },
  {
    id: "2",
    title: "Revisar contrato de cliente",
    description: "Verificar cláusulas de renovação",
    status: "em-andamento",
    due_date: "2025-04-17",
    created_by: "user1",
    priority: "media",
  },
  {
    id: "3",
    title: "Responder e-mails pendentes",
    description: "Priorizar e-mails urgentes de clientes",
    status: "pendente",
    due_date: "2025-04-15",
    created_by: "user1",
    priority: "baixa",
  },
  {
    id: "4",
    title: "Atualizar planilha de horas",
    description: "Registrar horas trabalhadas na semana",
    status: "concluida",
    due_date: "2025-04-12",
    created_by: "user1",
    priority: "media",
  },
  {
    id: "5",
    title: "Organizar arquivos da pasta compartilhada",
    description: "Criar nova estrutura de pastas",
    status: "concluida",
    due_date: "2025-04-10",
    created_by: "user1",
    priority: "baixa",
  },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockPersonalTasks);

  // Manipuladores de eventos para as tarefas
  const handleAddTask = () => {
    console.log("Adicionar nova tarefa pessoal");
    // Aqui você abriria um modal para adicionar uma nova tarefa
  };

  const handleEditTask = (task: Task) => {
    console.log("Editar tarefa pessoal", task);
    // Aqui você abriria um modal para editar a tarefa
  };

  const handleDeleteTask = (id: string) => {
    console.log("Excluir tarefa pessoal", id);
    // Aqui você confirmaria a exclusão e removeria do estado/banco
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleStatusChange = (id: string, status: TaskStatus) => {
    console.log("Alterar status da tarefa pessoal", id, status);
    // Aqui você atualizaria o status no estado/banco
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status } : task
    ));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={currentUser} />
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tarefas Pessoais</h1>
            <p className="text-muted-foreground">
              Gerencie suas tarefas individuais e acompanhe seu progresso.
            </p>
          </div>

          <div className="bg-card rounded-lg border shadow-sm p-6">
            <UserTaskList
              tasks={tasks}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
