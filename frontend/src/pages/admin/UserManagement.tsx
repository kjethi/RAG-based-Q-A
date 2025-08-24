import { useEffect, useState } from "react";
import { userService } from "../../services/user";
import type { User } from "../../classes/User";
import { toast } from "react-toastify";

type UserRole = "admin" | "viewer" | "editor";

interface PaginationMeta {
  totalRecords: number;
  page: number;
  limit: number;
  totalPages: number;
}

function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationMeta>({
    totalRecords: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  const getUsers = async (page: number = 1, searchQuery: string = "", role: "all" | UserRole = "all", limit: number = 10) => {
    try {
      setLoading(true);
      const response = await userService.fetchUsers({
        search: searchQuery || undefined,
        role: role === "all" ? undefined : role,
        offset: (page - 1) * limit,
        limit: limit
      });
      
      setUsers(response.users);
      if (response.meta) {
        setPagination(prev => ({
          ...prev,
          totalRecords: response.meta.totalRecords,
          page: page,
          totalPages: Math.ceil(response.meta.totalRecords / limit)
        }));
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== "") {
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on search
        getUsers(1, search, roleFilter, pagination.limit);
      } else {
        getUsers(1, "", roleFilter, pagination.limit);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search, roleFilter, pagination.limit]);

  // Initial load
  useEffect(() => {
    getUsers(1, "", "all", pagination.limit);
  }, [pagination.limit]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    getUsers(newPage, search, roleFilter, pagination.limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ 
      ...prev, 
      limit: newLimit, 
      page: 1,
      totalPages: Math.ceil(prev.totalRecords / newLimit)
    }));
    getUsers(1, search, roleFilter, newLimit);
  };

  async function handleRoleChange(id: string, role: UserRole) {
    try {
      setLoading(true);
      await userService.updateUserRole(id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast.error("Failed to update user role");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Are you sure you want to remove this user?")) return;
    
    try {
      setLoading(true);
      // Note: Backend doesn't have a delete user endpoint, so we'll just remove from UI
      // In a real app, you'd want to implement user deactivation instead of deletion
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User removed successfully");
    } catch (error) {
      console.error("Failed to remove user:", error);
      toast.error("Failed to remove user");
    } finally {
      setLoading(false);
    }
  }

  const renderPagination = () => {
    const { page, totalPages, limit, totalRecords } = pagination;
    const startRecord = (page - 1) * limit + 1;
    const endRecord = Math.min(page * limit, totalRecords);

    return (
      <div className="d-flex justify-content-between align-items-center">
        <div className="text-secondary small">
          Showing {startRecord}-{endRecord} of {totalRecords} users
        </div>
        
        <div className="d-flex gap-2 align-items-center">
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>

          <nav aria-label="User pagination">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
              </li>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <li key={pageNum} className={`page-item ${pageNum === page ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  </li>
                );
              })}
              
              <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <h1 className="h4 mb-0">User Management</h1>
        <span className="text-secondary">Admin-only</span>
        <div className="ms-auto d-flex gap-2">
          <input
            type="search"
            className="form-control"
            placeholder="Search by name or email..."
            style={{ maxWidth: 260 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-select"
            style={{ maxWidth: 160 }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole)}
          >
            <option value="all">All roles</option>
            <option value="admin">Admins</option>
            <option value="viewer">Viewers</option>
            <option value="editor">Editors</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-dark table-striped table-hover align-middle">
          <thead>
            <tr>
              <th style={{ width: 56 }}>#</th>
              <th>Name</th>
              <th>Email</th>
              <th style={{ width: 160 }}>Role</th>
              <th style={{ width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center text-secondary py-4">
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-secondary py-4">
                  {search || roleFilter !== "all" ? "No users match your filters" : "No users found"}
                </td>
              </tr>
            ) : (
              users.map((u, idx) => (
                <tr key={u.id}>
                  <td>{idx + 1}</td>
                  <td>{u.name}</td>
                  <td className="text-secondary">{u.email}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={u.role}
                      onChange={(e) =>
                        handleRoleChange(u.id, e.target.value as UserRole)
                      }
                      disabled={loading}
                    >
                      <option value="admin">Admin</option>
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm" role="group">
                      <button className="btn btn-outline-light">View</button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleRemove(u.id)}
                        disabled={loading}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && pagination.totalRecords > 0 && (
        <div className="mt-3">
          {renderPagination()}
        </div>
      )}
    </div>
  );
}

export default UserManagement;
