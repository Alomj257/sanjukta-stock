import React, { useState, useEffect, useRef } from "react";
import DataTable from "../../../components/dataTable/DataTable";
import { FaEye } from "react-icons/fa";
import { MdCheck, MdClose, MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import apis from "../../../utils/apis";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import DeleteModal from "../../../components/model/DeleteModal";

const NotificationSection = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [id, setId] = useState("");

  const email = localStorage.getItem("email");

  useEffect(() => {
    const getUserByEmail = async () => {
      try {
        const apiUrl = apis().getUserByEmail(email);
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch user details");
        const result = await response.json();
        if (!result?.user) {
          throw new Error("User details are missing in the response.");
        }
        setId(result?.user?._id);
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error(
          error.message || "Something went wrong while fetching user details."
        );
      }
    };
    getUserByEmail();
  }, [email]);
  useEffect(() => {
    if (id) {
      fetchSection();
    }
  }, [id]);

  const fetchSection = async () => {
    setLoading(true);
    try {
      const apiUrl = apis().getSectionByUserId(id, "assign");
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Failed to fetch section details");
      const result = await response.json();
      setSection(result.section);
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  

  const handleView = (row) => {
    navigate(`/user/section`, {
      state: "review",
    });
  };

  const handleAccept = async(row) => {
    if (!row) return;
    try {
      const acceptUrl = apis().updateSectionStatus(row._id,"accept");
      const response = await fetch(acceptUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      if (!response.ok) throw new Error("Failed to accept section");
      toast.success(" Section accepted successfully");
      fetchSection();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setShowDeleteModal(false);
      setSectionToDelete(null);
    }
  };

  const handleDelete = (section) => {
    setSectionToDelete(section);
    setShowDeleteModal(true);
  };

  const confirmReject = async () => {
    if (!sectionToDelete) return;
    try {
      const deleteUrl = apis().updateSectionStatus(sectionToDelete._id,"reject");
      const response = await fetch(deleteUrl, { method: "PUT" });
      if (!response.ok) throw new Error("Failed to delete section");
      toast.success(" Section status updated successfully");
      fetchSection();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setShowDeleteModal(false);
      setSectionToDelete(null);
    }
  };
  return (
    <div className="section-container">
      {loading ? (
        <div className="loading-spinner">
          <ClipLoader size={30} color="#00BFFF" loading={loading} />
        </div>
      ) : !section ? (
        <div className="text-center">No Data</div>
      ) : (
        <table className="w-100 bordered table">
          <thead>
            <tr>
              <th>Section Name</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{section?.sectionName}</td>
              <td className="text-center">
                <div className="d-flex gap-4 justify-content-center">
                  <button
                    onClick={() => handleView(section)}
                    className="readBtn Btn"
                  >
                    <FaEye /> See
                  </button>
                  <button
                    onClick={() => handleAccept(section)}
                    className="editBtn Btn"
                  >
                    <MdCheck /> Accept 
                  </button>
                  <button
                    onClick={() => handleDelete(section)}
                    className="deleteBtn Btn"
                  >
                    <MdClose /> Reject
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {showDeleteModal && (
        <DeleteModal
          supplierName={sectionToDelete.supplierName}
          onConfirm={confirmReject}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default NotificationSection;
