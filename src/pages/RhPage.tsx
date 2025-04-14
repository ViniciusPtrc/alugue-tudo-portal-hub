
import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Plus, Search, User, UserPlus, Users } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserTaskList } from "@/components/user-task-list";
import { Task } from "@/components/task-card";

const currentUser = {
  name: "João Silva",
  email: "joao.silva@aluguetudo.com",
  role: ["admin", "rh"],
};

// Exemplo de dados de funcionários
interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  joinDate: string;
  birthday: string;
}

const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "Maria Oliveira",
    email: "maria.oliveira@aluguetudo.com",
    phone: "(11) 98765-4321",
    position: "Analista de RH",
    department: "RH",
    joinDate: "2022-03-15",
    birthday: "1990-04-16",
  },
  {
    id: "2",
    name: "Carlos Santos",
    email: "carlos.santos@aluguetudo.com",
    phone: "(11) 91234-5678",
    position: "Vendedor",
    department: "Comercial",
    joinDate: "2021-08-20",
    birthday: "1985-07-10",
  },
  {
    id: "3",
    name: "Ana Luiza",
    email: "ana.luiza@aluguetudo.com",
    phone: "(11) 99876-5432",
    position: "Gerente Financeiro",
    department: "Financeiro",
    joinDate: "2020-01-10",
    birthday: "1982-11-25",
  },
];

// Exemplo de tarefas do RH
const mockRhTasks: Task[] = [
  {
    id: "1",
    title: "Processo seletivo desenvolvedor",
    description: "Analisar currículos e agendar entrevistas",
    status: "em-andamento",
    due_date: "2025-04-22",
    sector: "RH",
    created_by: "user1",
    priority: "alta",
  },
  {
    id: "2",
    title: "Integração novo funcionário",
    description: "Preparar documentação e treinamento inicial",
    status: "pendente",
    due_date: "2025-04-18",
    sector: "RH",
    created_by: "user1",
    priority: "media",
  },
  {
    id: "3",
    title: "Atualizar política de férias",
    description: "Revisar e publicar nova política",
    status: "concluida",
    due_date: "2025-04-10",
    sector: "RH",
    created_by: "user1",
    priority: "baixa",
  },
];

export default function RhPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [tasks, setTasks] = useState<Task[]>(mockRhTasks);
  
  // Filtra os funcionários com base na pesquisa e filtro de departamento
  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });
  
  // Estatísticas de RH
  const totalEmployees = mockEmployees.length;
  const pendingTasks = tasks.filter(task => task.status === "pendente").length;
  const completedTasks = tasks.filter(task => task.status === "concluida").length;
  
  // Manipuladores de eventos para tarefas
  const handleAddTask = () => {
    console.log("Adicionar nova tarefa de RH");
  };

  const handleEditTask = (task: Task) => {
    console.log("Editar tarefa de RH", task);
  };

  const handleDeleteTask = (id: string) => {
    console.log("Excluir tarefa de RH", id);
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleStatusChange = (id: string, status: "pendente" | "em-andamento" | "concluida") => {
    console.log("Alterar status da tarefa de RH", id, status);
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
            <h1 className="text-2xl font-bold tracking-tight">Recursos Humanos</h1>
            <p className="text-muted-foreground">
              Gerencie funcionários, processos de RH e acompanhe métricas.
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total de Funcionários"
              value={totalEmployees}
              icon={Users}
              iconColor="text-primary"
            />
            <StatCard
              title="Tarefas Pendentes"
              value={pendingTasks}
              icon={Clock}
              iconColor="text-yellow-500"
            />
            <StatCard
              title="Tarefas Concluídas"
              value={completedTasks}
              icon={CheckCircle}
              iconColor="text-green-500"
            />
          </div>

          {/* Abas para diferentes funcionalidades */}
          <Tabs defaultValue="employees" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="employees">Funcionários</TabsTrigger>
              <TabsTrigger value="tasks">Tarefas do Setor</TabsTrigger>
            </TabsList>
            
            {/* Aba de Funcionários */}
            <TabsContent value="employees" className="mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Cadastro de Funcionários</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Buscar funcionário..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Todos os setores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os setores</SelectItem>
                        <SelectItem value="RH">RH</SelectItem>
                        <SelectItem value="Comercial">Comercial</SelectItem>
                        <SelectItem value="Financeiro">Financeiro</SelectItem>
                        <SelectItem value="Operacional">Operacional</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Novo Funcionário
                    </Button>
                  </div>
                  
                  {filteredEmployees.length === 0 ? (
                    <div className="text-center py-12">
                      <User className="h-12 w-12 mx-auto text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">Nenhum funcionário encontrado</h3>
                      <p className="text-muted-foreground mt-2">
                        Tente ajustar os filtros ou cadastre um novo funcionário.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <div className="relative overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="px-4 py-3 text-left font-medium">Nome</th>
                              <th className="px-4 py-3 text-left font-medium">Cargo</th>
                              <th className="px-4 py-3 text-left font-medium">Setor</th>
                              <th className="px-4 py-3 text-left font-medium">Contato</th>
                              <th className="px-4 py-3 text-left font-medium">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {filteredEmployees.map((employee) => (
                              <tr key={employee.id} className="hover:bg-muted/50">
                                <td className="px-4 py-3">{employee.name}</td>
                                <td className="px-4 py-3">{employee.position}</td>
                                <td className="px-4 py-3">{employee.department}</td>
                                <td className="px-4 py-3">
                                  <div>{employee.email}</div>
                                  <div className="text-muted-foreground">{employee.phone}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <Button variant="ghost" size="sm">
                                    Editar
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Aba de Tarefas do Setor */}
            <TabsContent value="tasks" className="mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Tarefas do RH</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserTaskList
                    tasks={tasks}
                    onAddTask={handleAddTask}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
