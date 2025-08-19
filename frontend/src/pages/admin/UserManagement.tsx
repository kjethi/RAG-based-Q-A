import { useState } from "react";
type UserRole = "admin" | "viewer" | "editor";
type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

const mockUsers: UserRow[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "admin" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", role: "viewer" },
  { id: "3", name: "Carol Tan", email: "carol@example.com", role: "editor" },
];

function UserManagement() {
  const [users, setUsers] = useState<UserRow[]>(mockUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");

  const filtered = users.filter((u) => {
    const matchesQuery = (u.name + u.email)
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  function handleRoleChange(id: string, role: UserRole) {
    // TODO: Call backend to update role, then refresh list
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  }

  return (
    <div>
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <h1 className="h4 mb-0">User Management</h1>
        <span className="text-secondary">Admin-only</span>
        <div className="ms-auto d-flex gap-2">
          <input
            type="search"
            className="form-control"
            placeholder="Search"
            style={{ maxWidth: 260 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-select"
            style={{ maxWidth: 160 }}
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value as UserRole)
            }
          >
            <option value="all">All roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
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
            {filtered.map((u, idx) => (
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
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </td>
                <td>
                  <div className="btn-group btn-group-sm" role="group">
                    <button className="btn btn-outline-light">View</button>
                    <button className="btn btn-outline-danger">Remove</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-secondary py-4">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;
