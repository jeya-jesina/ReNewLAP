
import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  Pencil,
  Search,
  UserPlus,
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const PER_PAGE = 10;

export default function CashierList() {

  const [cashiers, setCashiers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
const MAX_CASHIERS = 3;

const isLimitReached =
  cashiers.length >= MAX_CASHIERS;
  /* FETCH */

  const fetchCashiers = async () => {

    try {

      const user = JSON.parse(
        localStorage.getItem("user")
      );

      const res = await api.post(
        "/cashier/get_cashiers.php",
        {
          admin_id: user.id
        }
      );

      if (res.data.status) {

        setCashiers(res.data.data);

      }

    } catch (err) {

      console.error(err);

    }
  };

  useEffect(() => {

    fetchCashiers();

  }, []);

  /* TOGGLE STATUS */

  const toggleStatus = async (cashier) => {

    const newStatus =
      cashier.status === "active"
        ? "inactive"
        : "active";

    try {

      const res = await api.post(
        "/cashier/toggle_status_cashier.php",
        {
          id: cashier.id,
          status: newStatus,
        }
      );

      if (res.data.success) {

        setCashiers((prev) =>
          prev.map((c) =>
            c.id === cashier.id
              ? { ...c, status: newStatus }
              : c
          )
        );

      } else {

        alert(res.data.message);

      }

    } catch (err) {

      console.error(err);
      alert("Server Error");

    }
  };

  /* SEARCH */

  const filtered = cashiers.filter(c =>
    c.name
      ?.toLowerCase()
      .includes(search.toLowerCase()) ||

    c.email
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PER_PAGE)
  );

  const safePage = Math.min(page, totalPages);

  const paginated = filtered.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE
  );

  const handleSearch = (val) => {

    setSearch(val);
    setPage(1);

  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map(w => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "??";

  const avatarColors = [
    ["#dbeafe","#1d4ed8"],
    ["#ede9fe","#6d28d9"],
    ["#dcfce7","#15803d"],
    ["#fef3c7","#b45309"],
    ["#fce7f3","#be185d"],
    ["#e0f2fe","#0369a1"]
  ];

  const getColor = (name) =>
    avatarColors[
      (name?.charCodeAt(0) || 0)
      % avatarColors.length
    ];

  return (
    <>
      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .cl-root{
          font-family:'DM Sans',sans-serif;
          padding:2rem;
          min-height:100vh;
          background:#f0f5ff;
        }

        .cl-header{
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:1.75rem;
        }

        .cl-title{
          font-family:'Sora',sans-serif;
          font-size:26px;
          font-weight:700;
          color:#1e3a8a;
          margin:0;
        }

        .cl-title-sub{
          font-size:13px;
          color:#93a3b8;
          margin-top:4px;
        }

        .cl-add-btn{
          display:flex;
          align-items:center;
          gap:8px;
          background:linear-gradient(135deg,#1d4ed8,#3b82f6);
          color:#fff;
          border:none;
          border-radius:14px;
          padding:11px 20px;
          font-family:'Sora',sans-serif;
          font-size:14px;
          font-weight:600;
          cursor:pointer;
          box-shadow:0 4px 14px rgba(37,99,235,0.4);
        }

        .cl-add-btn.disabled{
  opacity:.6;
  cursor:not-allowed;
  box-shadow:none;
}

.cl-limit-note{
  margin-bottom:18px;
  background:#fff7ed;
  border:1px solid #fdba74;
  color:#c2410c;
  padding:14px 16px;
  border-radius:16px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:14px;
  font-size:14px;
  font-weight:500;
}

.cl-request-btn{
  border:none;
  background:linear-gradient(135deg,#ea580c,#f97316);
  color:#fff;
  padding:10px 16px;
  border-radius:12px;
  font-family:'Sora',sans-serif;
  font-size:13px;
  font-weight:600;
  cursor:pointer;
  white-space:nowrap;
  box-shadow:0 4px 12px rgba(249,115,22,.25);
}

        .cl-search-wrap{
          position:relative;
          margin-bottom:1.5rem;
        }

        .cl-search-icon{
          position:absolute;
          left:16px;
          top:50%;
          transform:translateY(-50%);
          color:#93c5fd;
        }

        .cl-search{
          width:100%;
          padding:13px 16px 13px 46px;
          border-radius:14px;
          border:1.5px solid #e2e8f0;
          background:#fff;
          font-size:14px;
          outline:none;
        }

        .cl-card{
          background:#fff;
          border-radius:22px;
          overflow:hidden;
          border:1px solid #e2e8f0;
          box-shadow:0 4px 24px rgba(37,99,235,0.08);
        }

        .cl-thead{
          display:grid;
          grid-template-columns:2fr 2.5fr 1fr 1fr;
          padding:0 1.5rem;
          background:linear-gradient(to right,#eff6ff,#f0f9ff);
          border-bottom:1.5px solid #e0ecff;
        }

        .cl-th{
          padding:13px 0;
          font-size:11px;
          font-weight:700;
          letter-spacing:0.07em;
          text-transform:uppercase;
          color:#3b82f6;
        }

        .cl-row{
          display:grid;
          grid-template-columns:2fr 2.5fr 1fr 1fr;
          padding:0 1.5rem;
          border-bottom:1px solid #f1f5f9;
          align-items:center;
        }

        .cl-row:last-child{
          border-bottom:none;
        }

        .cl-row:hover{
          background:#f8fbff;
        }

        .cl-cell{
          padding:14px 0;
        }

        .cl-name-wrap{
          display:flex;
          align-items:center;
          gap:11px;
        }

        .cl-avatar{
          width:36px;
          height:36px;
          border-radius:12px;
          display:flex;
          align-items:center;
          justify-content:center;
          font-family:'Sora',sans-serif;
          font-size:12px;
          font-weight:700;
        }

        .cl-name{
          font-weight:500;
          font-size:14px;
          color:#1e293b;
        }

        .cl-id-badge{
          font-size:10px;
          color:#94a3b8;
          background:#f1f5f9;
          border-radius:6px;
          padding:1px 6px;
          margin-top:2px;
          display:inline-block;
        }

        .cl-email{
          font-size:13.5px;
          color:#64748b;
        }

        .cl-actions{
          display:flex;
          justify-content:center;
          align-items:center;
          gap:10px;
        }

        .cl-btn-edit{
          width:34px;
          height:34px;
          border-radius:10px;
          border:none;
          background:#eff6ff;
          color:#2563eb;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
        }

        .cl-btn-edit:hover{
          background:#2563eb;
          color:#fff;
        }

        /* SWITCH */

        .cl-switch{
          position:relative;
          display:inline-block;
          width:46px;
          height:24px;
        }

        .cl-switch input{
          opacity:0;
          width:0;
          height:0;
        }

        .cl-slider{
          position:absolute;
          cursor:pointer;
          inset:0;
          background:#d1d5db;
          transition:.4s;
          border-radius:999px;
        }

        .cl-slider:before{
          position:absolute;
          content:"";
          height:18px;
          width:18px;
          left:3px;
          top:3px;
          background:white;
          transition:.4s;
          border-radius:50%;
          box-shadow:0 2px 6px rgba(0,0,0,0.25);
        }

        .cl-switch input:checked + .cl-slider{
          background:linear-gradient(135deg,#1d4ed8,#3b82f6);
        }

        .cl-switch input:checked + .cl-slider:before{
          transform:translateX(22px);
        }

        /* STATUS */

        .cl-status-badge{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          padding:4px 10px;
          border-radius:999px;
          font-size:11px;
          font-weight:700;
        }

        .cl-status-active{
          background:#dcfce7;
          color:#15803d;
          border:1px solid #bbf7d0;
        }

        .cl-status-inactive{
          background:#f1f5f9;
          color:#64748b;
          border:1px solid #e2e8f0;
        }

        .cl-empty{
          padding:3rem;
          text-align:center;
        }

        .cl-pagination{
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding:1rem 1.5rem;
          border-top:1px solid #e2e8f0;
          background:#f8fbff;
        }

        .cl-page-btns{
          display:flex;
          align-items:center;
          gap:6px;
        }

        .cl-page-nav,
        .cl-page-num{
          min-width:34px;
          height:34px;
          border-radius:10px;
          border:1px solid #e2e8f0;
          background:#fff;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
        }

        .cl-page-num.active{
          background:#2563eb;
          color:#fff;
          border-color:#2563eb;
        }

      `}</style>

      <div className="cl-root">

        {/* HEADER */}

        <div className="cl-header">

          <div>
            <h1 className="cl-title">
              Cashiers
            </h1>

            <p className="cl-title-sub">
              Manage your cashier accounts
            </p>
          </div>

          {/* <button
            className="cl-add-btn"
            onClick={() =>
              navigate("/cashier/add")
            }
          >
            <UserPlus size={16} />
            Add Cashier
          </button> */}

          <button
  className={`cl-add-btn ${
    isLimitReached
      ? "disabled"
      : ""
  }`}
  disabled={isLimitReached}
  onClick={() => {

    if (!isLimitReached) {

      navigate("/cashier/add");

    }

  }}
>
  <UserPlus size={16} />

  {isLimitReached
    ? "Add Cashier"
    : "Add Cashier"}
</button>

        </div>
{isLimitReached && (

  <div className="cl-limit-note">

    <div>
      Maximum 3 cashiers only allowed.
      To add more cashier accounts,
      please send a request.
    </div>

    <button
      className="cl-request-btn"
      onClick={() =>
         navigate("/cashier/add")
      }
    >
      Request Cashier
    </button>

  </div>

)}
        {/* SEARCH */}

        <div className="cl-search-wrap">

          <Search
            size={16}
            className="cl-search-icon"
          />

          <input
            className="cl-search"
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) =>
              handleSearch(e.target.value)
            }
          />

        </div>

        {/* TABLE */}

        <div className="cl-card">

          <div className="cl-thead">

            <span className="cl-th">
              Cashier
            </span>

            <span className="cl-th">
              Email
            </span>

            <span
              className="cl-th"
              style={{ textAlign:"center" }}
            >
              Actions
            </span>

            <span
              className="cl-th"
              style={{ textAlign:"center" }}
            >
              Status
            </span>

          </div>

          {paginated.length > 0 ? (

            paginated.map((c, i) => {

              const [bg, fg] =
                getColor(c.name);

              return (

                <div
                  key={c.id}
                  className="cl-row"
                >

                  {/* NAME */}

                  <div className="cl-cell">

                    <div className="cl-name-wrap">

                      <div
                        className="cl-avatar"
                        style={{
                          background:bg,
                          color:fg
                        }}
                      >
                        {getInitials(c.name)}
                      </div>

                      <div>

                        <div className="cl-name">
                          {c.name}
                        </div>

                        <span className="cl-id-badge">
                          ID #{c.id}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* EMAIL */}

                  <div className="cl-cell">

                    <span className="cl-email">
                      {c.email}
                    </span>

                  </div>

                  {/* ACTIONS */}

                  <div
                    className="cl-cell cl-actions"
                  >

                    <button
                      className="cl-btn-edit"
                      onClick={() =>
                        navigate(
                          `/cashier/edit/${c.id}`
                        )
                      }
                    >
                      <Pencil size={14} />
                    </button>

                    <label className="cl-switch">

                      <input
                        type="checkbox"
                        checked={
                          c.status === "active"
                        }
                        onChange={() =>
                          toggleStatus(c)
                        }
                      />

                      <span className="cl-slider"></span>

                    </label>

                  </div>

                  {/* STATUS */}

                  <div
                    className="cl-cell"
                    style={{
                      textAlign:"center"
                    }}
                  >

                    <span
                      className={`cl-status-badge ${
                        c.status === "active"
                          ? "cl-status-active"
                          : "cl-status-inactive"
                      }`}
                    >
                      {c.status}
                    </span>

                  </div>

                </div>

              );

            })

          ) : (

            <div className="cl-empty">

              <div
                style={{
                  marginBottom:"10px"
                }}
              >
                <Users
                  size={30}
                  color="#93c5fd"
                />
              </div>

              <p>
                No cashiers found
              </p>

            </div>

          )}

          {/* PAGINATION */}

          {filtered.length > PER_PAGE && (

            <div className="cl-pagination">

              <span>

                Showing
                {" "}
                <b>
                  {(safePage - 1)
                  * PER_PAGE + 1}
                  –
                  {
                    Math.min(
                      safePage * PER_PAGE,
                      filtered.length
                    )
                  }
                </b>

              </span>

              <div className="cl-page-btns">

                <button
                  className="cl-page-nav"
                  disabled={safePage === 1}
                  onClick={() =>
                    setPage(p => p - 1)
                  }
                >
                  <ChevronLeft size={15} />
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, i) => i + 1
                ).map((item) => (

                  <button
                    key={item}
                    className={`cl-page-num ${
                      item === safePage
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setPage(item)
                    }
                  >
                    {item}
                  </button>

                ))}

                <button
                  className="cl-page-nav"
                  disabled={
                    safePage === totalPages
                  }
                  onClick={() =>
                    setPage(p => p + 1)
                  }
                >
                  <ChevronRight size={15} />
                </button>

              </div>

            </div>

          )}

        </div>

      </div>
    </>
  );
}