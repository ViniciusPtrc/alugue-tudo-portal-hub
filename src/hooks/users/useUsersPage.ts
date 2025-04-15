
import { useState } from "react";
import { User } from "@/types/user";
import { useUsers } from "@/hooks/useUsers";

export const useUsersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToEdit, setUserToEdit] = useState<Partial<User>>({
    name: "",
    email: "",
    password: "",
    role: [],
    status: "ativo",
  });
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { users, isLoading, fetchUsers, createUser, updateUser, deleteUser } = useUsers();

  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddUser = () => {
    setUserToEdit({
      name: "",
      email: "",
      password: "",
      role: [],
      status: "ativo",
    });
    setOpenUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    setUserToEdit({ ...user, password: "" });
    setOpenUserDialog(true);
  };

  const handleSaveUser = async (user: Partial<User>, selectedRoles: string[]) => {
    if (!user.name || !user.email) {
      return false;
    }

    if (!user.id && (!user.password || user.password === "")) {
      return false;
    }

    if (selectedRoles.length === 0) {
      return false;
    }

    const success = user.id 
      ? await updateUser({ ...user, role: selectedRoles })
      : await createUser({ ...user, role: selectedRoles });
    
    if (success) {
      setOpenUserDialog(false);
      await fetchUsers();
    }
    
    return success;
  };

  const confirmDeleteUser = (id: string) => {
    setUserToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) {
      setOpenDeleteDialog(false);
      return false;
    }
    
    try {
      setIsDeleting(true);
      
      const idToDelete = userToDelete;
      const success = await deleteUser(idToDelete);
      
      setUserToDelete(null);
      setTimeout(() => setOpenDeleteDialog(false), 100);
      
      return success;
    } catch (error) {
      console.error("Error deleting user:", error);
      setUserToDelete(null);
      setTimeout(() => setOpenDeleteDialog(false), 100);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    openUserDialog,
    setOpenUserDialog,
    openDeleteDialog,
    setOpenDeleteDialog,
    userToEdit,
    userToDelete,
    isDeleting,
    users,
    filteredUsers,
    isLoading,
    fetchUsers,
    handleAddUser,
    handleEditUser,
    handleSaveUser,
    confirmDeleteUser,
    handleDeleteUser
  };
};
