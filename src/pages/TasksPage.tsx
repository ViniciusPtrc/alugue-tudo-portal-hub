
import { useState } from "react";
import { Header } from "@/components/header";
import { UserTaskList } from "@/components/user-task-list";
import { Task, TaskStatus } from "@/components/task-card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

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
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    status: "pendente",
    priority: "media",
  });

  // Manipuladores de eventos para as tarefas
  const handleAddTask = () => {
    setNewTask({
      title: "",
      description: "",
      status: "pendente",
      priority: "media",
    });
    setOpenTaskDialog(true);
  };

  const handleSaveTask = () => {
    if (!newTask.title) {
      toast.error("É necessário informar um título para a tarefa");
      return;
    }

    const taskId = crypto.randomUUID();
    const currentDate = new Date().toISOString().split("T")[0];
    
    const taskToAdd: Task = {
      id: taskId,
      title: newTask.title || "",
      description: newTask.description,
      status: newTask.status as TaskStatus || "pendente",
      priority: newTask.priority as "baixa" | "media" | "alta",
      created_by: currentUser.email,
      due_date: newTask.due_date || currentDate,
    };

    setTasks([taskToAdd, ...tasks]);
    setOpenTaskDialog(false);
    toast.success("Tarefa criada com sucesso!");
  };

  const handleEditTask = (task: Task) => {
    setNewTask({
      ...task
    });
    setOpenTaskDialog(true);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast.success("Tarefa excluída com sucesso!");
  };

  const handleStatusChange = (id: string, status: TaskStatus) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status } : task
    ));
    
    const statusMessages = {
      "em-andamento": "Tarefa iniciada com sucesso!",
      "concluida": "Tarefa concluída com sucesso!"
    };
    
    toast.success(statusMessages[status] || "Status da tarefa atualizado!");
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
      
      {/* Modal para adicionar/editar tarefa */}
      <Dialog open={openTaskDialog} onOpenChange={setOpenTaskDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {newTask.id ? "Editar Tarefa" : "Nova Tarefa"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                value={newTask.title || ""}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={newTask.description || ""}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Prioridade
              </Label>
              <Select
                value={newTask.priority || "media"}
                onValueChange={(value) => setNewTask({ ...newTask, priority: value as "baixa" | "media" | "alta" })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="due_date" className="text-right">
                Data de vencimento
              </Label>
              <Input
                id="due_date"
                type="date"
                value={newTask.due_date || ""}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenTaskDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTask}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
