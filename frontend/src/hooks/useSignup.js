import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";

const useSignup = () => {
    const queryClient = useQueryClient();

    const { mutate, isPending, error } = useMutation({
        mutationFn: signup,  // coming from api.js

        // on success, we want to call the /auth/me to get the authUser, and be redirected to the HomePage. (Go see App.jsx)
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] })
    });

    return {error, isPending, signUpMutation: mutate};
}

export default useSignup