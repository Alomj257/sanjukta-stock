import React, { useState, useEffect, useRef } from "react";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import apis from "../../../utils/apis";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import DeleteModal from "../../../components/model/DeleteModal";
import AddUpdateStock from "./addStock";
import { getAllDatesOfMonth } from "../../../utils/getDate";

const ViewDistribution = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [selectedDay, setSelectedDay] = useState(() => {
    const date = new Date();
    const formattedDate = `${date.toLocaleString("default", {
      month: "short",
    })} ${date.getDate()}`;
    return formattedDate;
  });
  const toastShownRef = useRef(false);
  const [popUp, setPopUp] = useState(false);
  const [details, setDetails] = useState({});
  const { state } = useLocation();
  const { sectionId } = state;
  
  const fetchDataByDate = async (date) => {
    setLoading(true);
    try {
      const response = await fetch(
        apis().getAllSectionsStockByDate(
          sectionId,
           new Date(date) 
        )
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();

      if (result && result.stocks && result.stocks.length >= 0) {
        setRecords(result.stocks);
      } else {
        throw new Error("No data found for this date");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataByDate(new Date());
  }, [selectedDay, sectionId]);

  const handleEdit = (row) => {
    // navigate(`/admin/section/edit/${row._id}`, { state: { sectionData: row } });
    setPopUp(true);
    setDetails(row);
  };

  const handleDelete = (section) => {
    setSectionToDelete(section);
    setShowDeleteModal(true);
  };
  const refetch = () => {
    fetchDataByDate();
  };

  const confirmDelete = async () => {
    if (!sectionToDelete) return;
    try {
      const deleteUrl = apis().deleteStockFromSection(
        sectionId,
        sectionToDelete._id?._id,
        sectionToDelete.date
      );
      const response = await fetch(deleteUrl, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete section");

      setRecords(
        records.filter((s) => {
          const stockDate = new Date(s?.date).getTime();
          const inputDate = new Date(sectionToDelete?.date).getTime();
          return !(
            s?._id?._id === sectionToDelete._id?._id && stockDate === inputDate
          );
        })
      );
      toast.success("Stock deleted successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setShowDeleteModal(false);
      setSectionToDelete(null);
    }
  };

  const HandleselectDate = (date, day) => {
    fetchDataByDate(date);
    setSelectedDay(day);
  };

  return (
    <div className="section-container">
      {/* <div className="section-search ">
        <button className="supplierBtn ms-auto" onClick={() => setPopUp(true)}>
          Add Stock
        </button>
      </div> */}
      <h4 className="mt-4">Stock Distribution</h4>

      <div className="dates d-flex gap-3 flex-wrap">
        {getAllDatesOfMonth(
          new Date().getMonth()+1,
          new Date().getFullYear()
        ).map((val, index) => (
          <div
            key={index}
            onClick={() => HandleselectDate(val?.date, val?.day)}
            className={`${
              selectedDay === val.day
                ? "bg-light text-dark border"
                : "bg-secondary text-white"
            } p-2 rounded  d-flex flex-column`}
            style={{ cursor: "pointer" }}
          >
            <span>{val?.day}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner">
          <ClipLoader size={30} color="#00BFFF" loading={loading} />
        </div>
      ) : (
        <div className="table_main">
          {records.length <= 0 ? (
            <>
              <div className="text-center">No Stock distributed</div>
            </>
          ) : (
            <table className="item-table">
              <thead>
                <tr>
                  <th>Stock </th>
                  <th>Quantity</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records?.map((item, index) => (
                  <tr key={index}>
                    <td>{item?._id?.itemName}</td>
                    <td>
                      {item?.qty}
                      {item?.unit}
                    </td>
                    <td>
                      {new Date(item?.date).toLocaleDateString()}{" "}
                      {new Date(item?.date).toLocaleTimeString()}
                    </td>
                    <td>
                      <div>
                        {/* <button onClick={() => handleView(row)} className='readBtn Btn'><FaEye /></button> */}
                        <button
                          onClick={() => handleEdit(item)}
                          className="editBtn Btn"
                        >
                          <MdEdit />
                        </button>
                        {/* <button
                          onClick={() => handleDelete(item)}
                          className="deleteBtn Btn"
                        >
                          <MdDelete />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {showDeleteModal && (
        <DeleteModal
          supplierName={sectionToDelete.supplierName}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
      {popUp && (
        <AddUpdateStock
          reFetch={refetch}
          details={details}
          setPopUp={setPopUp}
        />
      )}
    </div>
  );
};

export default ViewDistribution;
