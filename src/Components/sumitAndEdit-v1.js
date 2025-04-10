import React, { useState, useEffect, useRef } from "react";
import { TextInput, TextArea, Button, Loading, Accordion, AccordionItem } from "@carbon/react";
import { Network } from "vis-network/standalone";

const EditableForm = () => {
  const [customerId, setCustomerId] = useState("");
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [networkData, setNetworkData] = useState(null);
  const containerRef = useRef(null);
  const networkInstanceRef = useRef(null);

  useEffect(() => {
    if (networkData && containerRef.current) {
      const options = {
        nodes: { shape: "dot", size: 10 },
        edges: { width: 2, color: { inherit: false, opacity: 0.5 }, smooth: { type: "continuous" } },
        physics: { stabilization: true },
        layout: { improvedLayout: true },
      };

      if (networkInstanceRef.current) {
        networkInstanceRef.current.destroy();
      }

      networkInstanceRef.current = new Network(containerRef.current, networkData, options);

      setTimeout(() => {
        if (networkInstanceRef.current) {
          networkInstanceRef.current.fit();
        }
      }, 500);
    }
  }, [networkData]);

  const fetchNetworkData = async () => {
    try {
      const response = await fetch("https://marketing-backend-sales-and-marketing-sling.apps.67b2ba705f4b538adb2ae9a1.am1.techzone.ibm.com//network-data");
      const data = await response.json();

      const formattedEdges = data.edges.map((link) => ({
        from: link.from, 
        to: link.to,
      }));

      setNetworkData({ nodes: data.nodes, edges: formattedEdges });
    } catch (error) {
      console.error("Error fetching network data:", error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://marketing-backend-sales-and-marketing-sling.apps.67b2ba705f4b538adb2ae9a1.am1.techzone.ibm.com/get-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const data = await response.json();
      if (response.ok) {
        setFormData(data);
        fetchNetworkData();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://marketing-backend-sales-and-marketing-sling.apps.67b2ba705f4b538adb2ae9a1.am1.techzone.ibm.com:8000/update-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Data updated successfully!");
        setCustomerId("");
        setFormData(null);
        setIsEditing(false);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error updating data:", error);
      alert("Failed to update data");
    }
    setLoading(false);
  };

  const handleChange = (e, field) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    });
  };

  const handleAccordionOpen = () => {
    const observer = new MutationObserver(() => {
      if (networkInstanceRef.current) {
        networkInstanceRef.current.fit();
      }
    });
  
    if (containerRef.current) {
      observer.observe(containerRef.current, { attributes: true, childList: true, subtree: true });
      
      // Stop observing after a short delay to prevent unnecessary calls
      setTimeout(() => observer.disconnect(), 500);
    }
  };
  

  return (
    <div style={{ margin: "20px", paddingTop: "50px" }}>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
          <Loading description="Processing..." withOverlay={false} />
        </div>
      ) : (
        !formData ? (
          <>
            <TextInput
              id="customer-id"
              labelText="Enter Customer ID"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              style={{ marginBottom: "20px", width: "100%" }}
            />
            <Button onClick={handleSubmit} style={{ marginTop: "10px" }}>Fetch Data</Button>
          </>
        ) : (
          <div>
            <p style={{ fontSize: "30px", fontWeight: "bold", marginBottom: "20px" }}>
              <strong>User Data</strong>
            </p>
            {Object.keys(formData).map((field) => (
              <div key={field} style={{ marginBottom: "20px" }}>
                <label style={{ fontWeight: "bold", marginBottom: "5px" }}>
                  {field.replace(/_/g, " ")}:
                </label>

                {field === "body" ? (
                  <TextArea
                    id={field}
                    value={formData[field]}
                    onChange={(e) => handleChange(e, field)}
                    style={{
                      width: "100%",
                      minHeight: "150px",
                      resize: "vertical",
                      backgroundColor: isEditing ? "white" : "#f4f4f4",
                      pointerEvents: isEditing ? "auto" : "none",
                      opacity: isEditing ? 1 : 0.6,
                    }}
                  />
                ) : (
                  <TextInput
                    id={field}
                    value={formData[field]}
                    onChange={(e) => handleChange(e, field)}
                    style={{
                      width: "100%",
                      backgroundColor: isEditing ? "white" : "#f4f4f4",
                      pointerEvents: isEditing ? "auto" : "none",
                      opacity: isEditing ? 1 : 0.6,
                    }}
                  />
                )}
              </div>
            ))}
            {!isEditing ? (
              <>
                <Button onClick={() => setIsEditing(true)} style={{ marginTop: "10px" }}>Edit Data</Button>
                <Button onClick={handleSave} style={{ marginTop: "10px", marginLeft: "10px" }}>Save Data</Button>
              </>
            ) : (
              <Button onClick={handleSave} style={{ marginTop: "10px" }}>Save/Update</Button>
            )}
            <Accordion style={{ marginTop: "20px", border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
              <AccordionItem title={<strong>Customer ID: {customerId}</strong>} onClick={handleAccordionOpen}>
                <div
                  ref={containerRef}
                  style={{
                    height: "400px",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "1px solid #ddd",
                    overflow: "hidden",
                    position: "relative",
                  }}
                ></div>
              </AccordionItem>
            </Accordion>
          </div>
        )
      )}
    </div>
  );
};

export default EditableForm;
