import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./../../../../script/firebaseConfig";

const AdminDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editedData, setEditedData] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchReservations = async () => {
      const snapshot = await getDocs(collection(db, "meeting room"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReservations(data);
    };

    fetchReservations();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Delete this reservation?");
    if (!confirm) return;

    await deleteDoc(doc(db, "meeting room", id));
    setReservations(reservations.filter((res) => res.id !== id));
  };

  const handleEdit = (res) => {
    setEditId(res.id);
    setEditedData(res);
  };

  const handleSave = async () => {
    await updateDoc(doc(db, "meeting room", editId), editedData);
    setReservations((prev) =>
      prev.map((r) => (r.id === editId ? { ...editedData, id: editId } : r))
    );
    setEditId(null);
    setEditedData({});
  };

  const handleCancel = () => {
    setEditId(null);
    setEditedData({});
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reservations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reservations.length / itemsPerPage);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Meeting Room Dashboard
      </h2>
      <table className="w-full border ">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-center">Name</th>
            <th className="border px-2 py-1 text-center">Email</th>
            <th className="border px-2 py-1 text-center">Date</th>
            <th className="border px-2 py-1 text-center">Time</th>
             <th className="border px-2 py-1 text-center">Duration</th>
            <th className="border px-2 py-1 text-center">Guests List</th>
            <th className="border px-2 py-1 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((res) => (
            <tr key={res.id}>
              <td className="border px-2 py-1">
                {editId === res.id ? (
                  <input
                    value={editedData.name || ""}
                    onChange={(e) =>
                      setEditedData({ ...editedData, name: e.target.value })
                    }
                    className="border p-1"
                  />
                ) : (
                  res.name
                )}
              </td>
              <td className="border px-2 py-1">
                {editId === res.id ? (
                  <input
                    value={editedData.email || ""}
                    onChange={(e) =>
                      setEditedData({ ...editedData, email: e.target.value })
                    }
                    className="border p-1"
                  />
                ) : (
                  res.email
                )}
              </td>
           <td className="border px-2 py-1">
  {editId === res.id ? (
    <input
      type="date"
      value={editedData.date || ""}
      onChange={(e) =>
        setEditedData({ ...editedData, date: e.target.value })
      }
      className="border p-1"
    />
  ) : (
    res.date
      ? new Date(res.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-"
  )}
</td>

              <td className="border px-2 py-1">
                {editId === res.id ? (
                  <input
                    value={editedData.time || ""}
                    onChange={(e) =>
                      setEditedData({ ...editedData, time: e.target.value })
                    }
                    className="border p-1"
                  />
                ) : (
                  res.time
                )} 
                </td>

<td className="border px-2 py-1">
  {editId === res.id ? (
    <input
      value={editedData.duration || ""}
      onChange={(e) =>
        setEditedData({ ...editedData, duration: e.target.value })
      }
      className="border p-1"
    />
  ) : (
    res.duration ? parseFloat(res.duration.replace(/[^\d.]/g, '')) : "-"
  )}


              </td>
              <td className="border px-2 py-1">
  {editId === res.id ? (
    <input
      value={editedData.guests || ""}
      onChange={(e) =>
        setEditedData({ ...editedData, guests: e.target.value })
      }
      className="border p-1"
    />
  ) : (
    Array.isArray(res.guests)
      ? res.guests.join(", ")
      : typeof res.guests === "string"
        ? res.guests.split(",").map(g => g.trim()).join(", ")
        : "-"
  )}
</td>

              <td className="border px-4 py-2 space-x-2 w-44 whitespace-nowrap">
                {editId === res.id ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-400 text-white px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(res)}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleEdit(res)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(res.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1
                ? "bg-blue-800 text-white"
                : "bg-gray-300 text-gray-800"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
