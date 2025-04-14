
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type TaskStatus = "pendente" | "em-andamento" | "concluida";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  due_date?: string; // Changed from "string | Date" to just "string"
  sector?: string;
  created_by: string;
  priority?: "baixa" | "media" | "alta";
}

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  className?: string;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  className,
}: TaskCardProps) {
  // Função para formatar a data
  const formatDate = (date?: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  // Mapeia o status para cores
  const statusConfig = {
    pendente: {
      label: "Pendente",
      color: "status-pendente",
      icon: Clock,
    },
    "em-andamento": {
      label: "Em andamento",
      color: "status-em-andamento",
      icon: Clock,
    },
    concluida: {
      label: "Concluída",
      color: "status-concluida",
      icon: CheckCircle,
    },
  };

  const { label, color, icon: StatusIcon } = statusConfig[task.status];

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{task.title}</CardTitle>
          <Badge className={color}>{label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {task.description && (
          <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
        )}
        
        <div className="flex flex-col gap-2 text-sm">
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Vencimento: {formatDate(task.due_date)}</span>
            </div>
          )}
          
          {task.sector && (
            <div>
              <span className="text-muted-foreground">Setor: </span>
              <span>{task.sector}</span>
            </div>
          )}
          
          {task.priority && (
            <div>
              <span className="text-muted-foreground">Prioridade: </span>
              <span className="capitalize">{task.priority}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-4 gap-2">
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(task)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            )}
          </div>
          
          {onStatusChange && task.status !== "concluida" && (
            <Button
              variant="default"
              size="sm"
              onClick={() =>
                onStatusChange(
                  task.id,
                  task.status === "pendente" ? "em-andamento" : "concluida"
                )
              }
            >
              <StatusIcon className="h-4 w-4 mr-1" />
              {task.status === "pendente" ? "Iniciar" : "Concluir"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
