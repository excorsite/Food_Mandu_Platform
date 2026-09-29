import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import { API_ENDPOINTS } from "../../api/config";
import { SkeletonTableLoader } from "../../components/common/SkletonLoader";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => client.get("/users").then((r) => r.data),
  });
  const deleteUser = useMutation({
    mutationFn: (id) =>
      client.delete(API_ENDPOINTS.ADMIN_USER_DELETE.replace(":id", id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted");
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to delete user"),
  });
  if (isLoading) return <SkeletonTableLoader />;
  const users = data?.userData || data?.data || [];
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Users</h1>
      {users.length === 0 ? (
        <p className="text-gray-600">No users or failed to load.</p>
      ) : (
        users.map((u) => (
          <div
            key={u._id}
            className="bg-white p-4 rounded border mb-2 flex items-center justify-between gap-3"
          >
            <span>{u.userEmail || u.email}</span>
            <button
              type="button"
              disabled={deleteUser.isPending}
              onClick={() => {
                if (window.confirm("Delete this user?")) {
                  deleteUser.mutate(u._id);
                }
              }}
              className="rounded border border-red-200 px-3 py-1 text-sm text-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}
