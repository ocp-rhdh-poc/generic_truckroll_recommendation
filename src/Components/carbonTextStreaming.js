import React, { useState, useEffect, useRef } from "react";
import { Dropdown, TextArea, Button } from "@carbon/react";
import * as XLSX from "xlsx";

const FileTextStreamer = () => {
  const [data, setData] = useState([]);
  const [selectedCallId, setSelectedCallId] = useState(null);
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [newStreamText, setNewStreamText] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileInfo, setProfileInfo] = useState(null);
  const textAreaRef = useRef(null);
  const intervalRef = useRef(null); // Ref to store the interval ID
  const [streamedText, setStreamedText] = useState("");  // Add this line
  const [firstClick, setFirstClick] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0); // Timer state
  const timerRef = useRef(null); // Timer reference to clear it
  const [result, setResult] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/Test_data_results_demo_v3.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        if (!workbook.SheetNames.length) {
          throw new Error("No sheets found in the Excel file.");
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        if (!sheet) {
          throw new Error(`Sheet "${sheetName}" is empty or not found.`);
        }

        const jsonData = XLSX.utils.sheet_to_json(sheet);
        console.log(jsonData);

        setData(jsonData.map((row) => ({
          id: row.CALLID,
          label: row.CALLID,
          transcript: row.TRANSCRIPT,
          attributes_account: row.ATTRIBUTES_ACCOUNT,
          TRANSCRIPT_50: row.TRANSCRIPT_50, // Add 50% transcript
          TRANSCRIPT_70: row.TRANSCRIPT_70, // Add 70% transcript
        })));
      } catch (error) {
        console.error("Error loading Excel file:", error.message);
      }
    };

    fetchData();
  }, []);

  const testAllCallerIDs = async () => {
    console.log("Starting batch test for all CALLIDs...");
  
    // Array to hold matching results
    const matchingResults = [];
    const matchingResults2 = [];
  
    console.log(data);
    for (const item of data) {
      const transcript50 = item.TRANSCRIPT_50 || "";
      const transcript70 = item.TRANSCRIPT_70 || "";
      const accountId = item.id || "";
      console.log("Testing " + accountId);
  
      try {
        // Fetch result for 50% transcript
        const response50 = await fetch(
          `https://customer-experience-support-customer-experience-support.apps.67b2ba705f4b538adb2ae9a1.am1.techzone.ibm.com/api/truckRollRecommendation?attributes_account=${encodeURIComponent(accountId)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ call_transcript: transcript50 }),
          }
        );
        const result50 = await response50.json();
  
        // Fetch result for 70% transcript
        const response70 = await fetch(
          `https://customer-experience-support-customer-experience-support.apps.67b2ba705f4b538adb2ae9a1.am1.techzone.ibm.com/api/truckRollRecommendation?attributes_account=${encodeURIComponent(accountId)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ call_transcript: transcript70 }),
          }
        );
        const result70 = await response70.json();
  
        // Check if it meets the criteria
        
        console.log(" - " + result50["Technician Visit Required"] + ":" + result70["Technician Visit Required"])
        if (result50["Technician Visit Required"] === 1 && result70["Technician Visit Required"] === 0) {
          matchingResults.push(item.id);
          console.log(" - Found Discrepency!");
        }
        else if (result50["Technician Visit Required"] === 0 && result70["Technician Visit Required"] === 1) {
          matchingResults2.push(item.id);
          console.log(" - Found Discrepency!");
        }
      } catch (error) {
        console.error(`Error processing CALLID ${item.id}:`, error);
      }
    }
  
    console.log("CALLIDs meeting the criteria (1 for 50% & 0 for 70%):", matchingResults);
    console.log("CALLIDs meeting the criteria (0 for 50% & 1 for 70%):", matchingResults2);
  };
  

  const fetchProfileInfo = async (accountId) => {
    // try {
      // const response = await fetch(
      //   `https://customer-experience-support-customer-experience-support.apps.67b2ba705f4b538adb2ae9a1.am1.techzone.ibm.com/profile/${encodeURIComponent(accountId)}`
      // );
      const result = [];
      setProfileInfo(result);
    // } catch (error) {
    //   console.error("Error fetching profile info:", error);
    // }
  };

  const streamText = (fullText, accountId) => {
    // Reset previous streamed text and status
    setText("");
    setStreamedText("");
    setStreaming(true);
    setElapsedTime(0); // Reset the timer when starting new stream

    // Start the timer
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1); // Increase the time every second
    }, 1000);

    // Fetch the profile info
    fetchProfileInfo(accountId);

    // Clean the text to remove unwanted parts (timestamps)
    const cleanedText = fullText.replace(/\b\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\b/g, "");

    let index = 0;

    // Clear any existing interval before starting a new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start a new interval for streaming text
    intervalRef.current = setInterval(() => {
      if (index < cleanedText.length) {
        setStreamedText((prev) => prev + cleanedText[index]);
        setText((prev) => prev + cleanedText[index]);
        index++;
        autoScroll();
      } else {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        //setStreaming(false);

        // Stop the timer once streaming ends
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 45);
  };

  const autoScroll = () => {
    if (textAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = textAreaRef.current;
      const isUserScrolledUp = scrollTop + clientHeight < scrollHeight - 10;

      if (!isUserScrolledUp) {
        textAreaRef.current.scrollTop = scrollHeight;
      }
    }
  };

  const handleSelectionChange = ({ selectedItem }) => {
    setSelectedCallId(selectedItem.id);

    // Clear all previous state related to text before streaming new data
    setText("");
    setFirstClick(true);
    setStreamedText("");
    setNewStreamText("");
    setProfileInfo(null);

    // Find the selected data and start streaming
    const selectedData = data.find((item) => item.id === selectedItem.id);
    //testAllCallerIDs();
    if (selectedData) {
      streamText(selectedData.transcript, selectedData.attributes_account);
    }
  };

  const handleExport = () => {
    //if (firstClick)
    // firstClick ? handleAIRecommendation50() : handleAIRecommendation70();
  };

  // AI Recommendation 50% Handler
  const handleAIRecommendation50 = async () => {
    if (!selectedCallId || loading) return;

    setLoading(true);
    const selectedData = data.find((item) => item.id === selectedCallId);
    if (selectedData) {
      const transcript50 = selectedData.TRANSCRIPT_50 || ""; // Extract 50% transcript
      const accountId = selectedData.attributes_account || "";

      try {
        const response = await fetch(
          `https://customer-experience-support-customer-experience-support.apps.67b2ba705f4b538adb2ae9a1.am1.techzone.ibm.com/api/truckRollRecommendation?attributes_account=${encodeURIComponent(accountId)}`,
          { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              call_transcript: transcript50, // Sending the transcript in the body
            }),
          }
        );

        const result = await response.json();
        console.log(result);
        const recommendationText = `Technician Visit Required: ${result["Technician Visit Required"]}\n\nReason: ${result.Reason}\n\n Confidence: ${result.Confidence*100}%`;
        setNewStreamText(recommendationText);
      } catch (error) {
        console.error("Error during API call:", error);
      } finally {
        setLoading(false);
        //setFirstClick(false);
      }
    }
  };

  // AI Recommendation 70% Handler
  const handleAIRecommendation70 = async () => {
    console.log("Push");
    if (!selectedCallId || loading) return;
    console.log("Pop");

    setLoading(true);
    const selectedData = data.find((item) => item.id === selectedCallId);
    if (selectedData) {
      const transcript70 = selectedData.TRANSCRIPT_70 || ""; // Extract 70% transcript
      const accountId = selectedData.attributes_account || "";

      try {
        const response = await fetch(
          `https://customer-experience-support-customer-experience-support.apps.67b2ba705f4b538adb2ae9a1.am1.techzone.ibm.com/api/truckRollRecommendation?attributes_account=${encodeURIComponent(accountId)}`,
          { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              call_transcript: transcript70, // Sending the transcript in the body
            }),
          }
        );

        const result = await response.json();
        console.log(result);
        const recommendationText = `Technician Visit Required: ${result["Technician Visit Required"]}\n\nReason: ${result.Reason}\n\n Confidence: ${result.Confidence*100}%`;
        setNewStreamText(recommendationText);
      } catch (error) {
        console.error("Error during API call:", error);
      } finally {
        setLoading(false);
        // setFirstClick(true);
      }
    }
  };

  return (
    <div style={{ margin: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{marginTop:"70px", marginBottom: "20px" }}>
        <Dropdown
          id="call-id-dropdown"
          titleText={<span style={{ fontSize: "15px" }}>Select Call ID</span>}
          label="Choose Call ID"
          items={data}
          itemToString={(item) => (item ? item.label : "")}
          onChange={handleSelectionChange}
        />
      </div>

      {profileInfo && (
        <div style={{ 
          fontSize: "12px", 
          marginBottom: "10px",
          border: "1px solid #dcdcdc", 
          padding: "10px", 
          borderRadius: "5px",
          color: "gray",
        }}>
          User Profile
          <br />
          <br />
          <div style={{ 
            fontSize: "13px", 
            lineHeight: "1.25", 
            paddingLeft: "15px",
            color: "black",
            fontStyle: "italic"
          }}>
            <strong>Customer name:</strong>				John Doe <br />
            <strong>Recent Issues Summary:</strong>	The customer has been experiencing issues with their receiver, including a lost connection to the antenna and the need to upgrade or replace the receiver. They have also had issues with accessing certain channels, including ESPN and music channels. <br />
            <strong>Customer Technical Proficiency:</strong>	Low <br />
            <strong>Last Technician Visit:</strong>	Not any recent visits <br />
            <strong>Last Technician Visit Reason:</strong>	N/A
          </div>
        </div>
      )}



      {streaming && (
        <div style={{ marginBottom: "20px", position: "relative" }}>
          <TextArea
            ref={textAreaRef}
            labelText="Streaming Transcript"
            value={text}
            rows={10}
            readOnly
          />
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              fontSize: "14px",
              color: "#0078d4",
            }}
          >

          </div>
        </div>
      )}

      {text && (
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
          <Button
            disabled={!selectedCallId || streamedText.length === 0 || loading}
          >
            {loading ? "Loading..." : "AI Recommendation"}
          </Button>
        </div>
      )}

      {newStreamText && (
        <div style={{ marginBottom: "20px" }}>
          <TextArea
            labelText="AI Recommendation Output"
            value={loading ? "Loading..." : newStreamText}
            readOnly
            rows={6}
          />
        </div>
      )}
    </div>
  );
};

export default FileTextStreamer;
