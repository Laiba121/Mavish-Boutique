// src/pages/admin/ContactsAdmin.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import { Trash2 } from "lucide-react";

export default function ContactsAdmin() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/contacts"
      );

      setContacts(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm("Delete this message?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/admin/contacts/${id}`
      );

      setContacts((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-[28px] font-black text-black">
              Contact Messages
            </h1>

            <p className="mt-1 text-[14px] text-gray-500">
              Manage customer contact messages
            </p>
          </div>

          {loading ? (
            <div className="text-[15px] font-semibold">
              Loading...
            </div>
          ) : contacts.length === 0 ? (
            <div className="rounded-xl bg-white p-6 text-[15px] font-semibold shadow-sm">
              No contact messages found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
              <table className="min-w-full">
                <thead className="border-b bg-[#fafafa]">
                  <tr>
                    <th className="px-5 py-4 text-left text-[13px] font-black uppercase">
                      Name
                    </th>

                    <th className="px-5 py-4 text-left text-[13px] font-black uppercase">
                      Phone
                    </th>

                    <th className="px-5 py-4 text-left text-[13px] font-black uppercase">
                      Email
                    </th>

                    <th className="px-5 py-4 text-left text-[13px] font-black uppercase">
                      Message
                    </th>

                    <th className="px-5 py-4 text-left text-[13px] font-black uppercase">
                      Date
                    </th>

                    <th className="px-5 py-4 text-left text-[13px] font-black uppercase">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {contacts.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b last:border-none"
                    >
                      <td className="px-5 py-4 text-[14px] font-semibold">
                        {item.name || "-"}
                      </td>

                      <td className="px-5 py-4 text-[14px]">
                        {item.phone || "-"}
                      </td>

                      <td className="px-5 py-4 text-[14px]">
                        {item.email}
                      </td>

                      <td className="max-w-[350px] px-5 py-4 text-[14px] leading-6">
                        {item.comment}
                      </td>

                      <td className="px-5 py-4 text-[14px]">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => deleteContact(item._id)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-all hover:bg-red-200"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}