import React, { useState } from "react";

export default function TenantManagement() {
  const [tenants, setTenants] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "09171234567",
      unit: "Unit 101",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "09281234567",
      unit: "Unit 202",
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: "",
    email: "",
    phone: "",
    unit: "",
  });

  const handleInputChange = (e) => {
    setNewTenant({ ...newTenant, [e.target.name]: e.target.value });
  };

  const handleAddTenant = () => {
    const id = tenants.length + 1;
    setTenants([...tenants, { id, ...newTenant }]);
    setNewTenant({ name: "", email: "", phone: "", unit: "" });
    setModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Tenant Management</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Tenant
        </button>
      </div>

     {/* Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
            <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Phone</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Unit</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Action</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {tenants.map((tenant) => (
                <tr key={tenant.id}>
                <td className="px-4 py-2">{tenant.name}</td>
                <td className="px-4 py-2">{tenant.email}</td>
                <td className="px-4 py-2">{tenant.phone}</td>
                <td className="px-4 py-2">{tenant.unit}</td>
                <td className="px-4 py-2">
                    <button
                    onClick={() => handleViewTenant(tenant)}
                    className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition"
                    >
                    View
                    </button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>


      {/* Modal */}
        {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

            <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative">
            <h2 className="text-xl font-semibold mb-4">Add Tenant</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Form */}
                <div>
                <div className="mb-4">
                    <label className="block text-sm font-medium">Name</label>
                    <input
                    type="text"
                    name="name"
                    value={newTenant.name}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 border rounded"
                    placeholder="Tenant name"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium">Email</label>
                    <input
                    type="email"
                    name="email"
                    value={newTenant.email}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 border rounded"
                    placeholder="Email address"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium">Phone</label>
                    <input
                    type="text"
                    name="phone"
                    value={newTenant.phone}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 border rounded"
                    placeholder="Phone number"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium">Unit</label>
                    <input
                    type="text"
                    name="unit"
                    value={newTenant.unit}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 border rounded"
                    placeholder="e.g. Unit 305"
                    />
                </div>
                </div>

                {/* Right: Selected Set / Preview */}
                <div className="bg-gray-50 p-4 rounded border h-full">
                <h3 className="text-lg font-semibold mb-4">Select Seats</h3>
                
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-6">
                <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                Cancel
                </button>
                <button
                onClick={handleAddTenant}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                Add Tenant
                </button>
            </div>
            </div>
        </div>
        )}

    </div>
  );
}
