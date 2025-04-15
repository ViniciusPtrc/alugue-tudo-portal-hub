
import { toast } from "sonner";
import { User } from "@/types/user";

export const useUserValidation = () => {
  const validateUserForm = (user: Partial<User>, selectedRoles: string[]): boolean => {
    if (!user.name || !user.email) {
      toast.error("Nome e e-mail são obrigatórios");
      return false;
    }

    if (!user.id && (!user.password || user.password === "")) {
      toast.error("Senha é obrigatória para novos usuários");
      return false;
    }

    if (selectedRoles.length === 0) {
      toast.error("Selecione pelo menos um papel/função");
      return false;
    }

    return true;
  };

  const showSuccessToast = (message: string) => {
    toast.success(message);
  };

  const showErrorToast = (message: string) => {
    toast.error(message);
  };

  return {
    validateUserForm,
    showSuccessToast,
    showErrorToast
  };
};
