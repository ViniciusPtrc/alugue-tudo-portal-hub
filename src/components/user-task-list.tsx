
import { useState } from "react";
import { Task, TaskCard, TaskStatus } from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle,
  Circle,
  Clock,
  Filter,
  List,
  Plus,
  SearchIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface UserTaskListProps {
  tasks: Task[];
  onAddTask?: () => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  sectors?: string[];
  className?: string;
}

export function UserTaskList({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  sectors = [],
  className,
}: UserTaskListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [sectorFilter, setSectorFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("due_date");

  const toggleStatusFilter = (status: TaskStatus) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  // Filtra e ordena as tarefas
  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(task.status);
      const matchesSector =
        !sectorFilter || task.sector === sectorFilter;
      return matchesSearch && matchesStatus && matchesSector;
    })
    .sort((a, b) => {
      if (sortBy === "due_date") {
        return new Date(a.due_date || 0).getTime() - new Date(b.due_date || 0).getTime();
      }
      if (sortBy === "priority") {
        const priorityRank = { alta: 3, media: 2, baixa: 1 };
        return (
          (priorityRank[b.priority || "baixa"] || 0) -
          (priorityRank[a.priority || "baixa"] || 0)
        );
      }
      if (sortBy === "status") {
        const statusRank = { pendente: 1, "em-andamento": 2, concluida: 3 };
        return statusRank[a.status] - statusRank[b.status];
      }
      return 0;
    });

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex-1 w-full md:max-w-md">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar tarefas..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("pendente")}
                onCheckedChange={() => toggleStatusFilter("pendente")}
              >
                <Circle className="h-4 w-4 mr-2 text-yellow-500" />
                Pendentes
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("em-andamento")}
                onCheckedChange={() => toggleStatusFilter("em-andamento")}
              >
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                Em andamento
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("concluida")}
                onCheckedChange={() => toggleStatusFilter("concluida")}
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Concluídas
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {sectors.length > 0 && (
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {sectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="due_date">Data de vencimento</SelectItem>
              <SelectItem value="priority">Prioridade</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          
          {onAddTask && (
            <Button onClick={onAddTask}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          )}
        </div>
      </div>
      
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <List className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Nenhuma tarefa encontrada</h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery || statusFilter.length > 0 || sectorFilter
              ? "Tente ajustar os filtros para ver mais resultados."
              : "Comece criando uma nova tarefa."}
          </p>
          {onAddTask && (
            <Button onClick={onAddTask} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
