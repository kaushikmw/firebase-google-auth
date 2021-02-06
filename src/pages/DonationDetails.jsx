import React, { memo, useState } from "react";
import GetReferenceDetails from "./GetReferenceDetails";
import { SiConvertio } from "react-icons/si";
import {
  PDFViewer,
  PDFDownloadLink,
  Document,
  Page,
  ReactPDF,
} from "@react-pdf/renderer";
import DonationReceipt from "./DonationReceipt";
import MyDialog from "./MyDialog";
import { firestore } from "../firebase/config";
export default memo(function DonationDetails({
  donations,
  donorDetails,
  donationType,
}) {
  const [canOpenConvertDialog, setCanOpenConvertDialog] = useState(false);
  const [currentCommitmentId, setCurrentCommitmentId] = useState("");
  const [currentCommitmentDate, setCurrentDommnetDate] = useState("");

  const handleConvertCommitmentDialogClose = () =>
    setCanOpenConvertDialog(false);
  //Converts commitment to donation
  //Checks: Donation date is today or in past
  const convertCommitmentToDonation = async () => {
    setCanOpenConvertDialog(false);
    console.log(`donationId: ${currentCommitmentId}`);
    console.log(`currentCommitmentDate: ${currentCommitmentDate}`);
    let tDate = new Date();
    let dDate = new Date(currentCommitmentDate);
    console.log(`dDate.getTime(): ${dDate.getTime()}`);
    console.log(`tDate.getTime(): ${tDate.getTime()}`);
    console.log(`donorDetails.id: ${donorDetails.id}`);
    console.log(`Result:  ${dDate.getTime() > tDate.getTime()}`);
    if (dDate.getTime() > tDate.getTime()) {
      //   console.log("Future commitments cannot be converted to donation.");
      alert("Future commitments cannot be converted to donation.");
    } else {
      console.log("Updating donation");
      await firestore
        .collection("donors")
        .doc(donorDetails.id)
        .collection("donations")
        .doc(currentCommitmentId)
        .update({ type: "Donation" });
    } //End of if else - if(dDate.getTime() <= tDate.getTime())
  };
  // const donationData = donations;
  const pdfFile = React.createRef();
  const donationList = donations.map((donation) => {
    return (
      <>
        {donationType == donation.type ? (
          <tr key={donation.id}>
            <td>{donation.date}</td>
            <td>{donation.amount}</td>
            <td>{donation.bank}</td>
            <td>{donation.bankRef}</td>
            <td>{donation.bankRefDate}</td>
            <td>
              {donation.collectedBy == "Self" ? (
                donorDetails.fullName
              ) : (
                <GetReferenceDetails refId={donation.collectedBy} />
              )}
            </td>{" "}
            <td>{donation.trust}</td>
            <td>{donation.mode}</td>
            <td>
              {donationType === "Donation" ? (
                <PDFDownloadLink
                  document={
                    <DonationReceipt donation={donation} donor={donorDetails} />
                  }
                  fileName={donation.id}
                  ref={pdfFile}
                  className="btn btn-link"
                >
                  {({ blob, url, loading, error }) =>
                    loading ? "Loading document..." : "Download here!"
                  }
                </PDFDownloadLink>
              ) : (
                <>
                  <button
                    className="btn btn-outline"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentCommitmentId(donation.id);
                      setCurrentDommnetDate(donation.date);
                      setCanOpenConvertDialog(true);
                    }}
                  >
                    <SiConvertio />
                  </button>
                  <MyDialog
                    open={canOpenConvertDialog}
                    handleClose={handleConvertCommitmentDialogClose}
                    dialogTitle="Commitment Conversion Confirmation"
                    dialogText="Are you sure you want to convert this commitment to donation?"
                    handleDefault={convertCommitmentToDonation}
                    defaultBtnText="Yes"
                    cancelBtnText="No"
                  />
                </>
              )}
            </td>
          </tr>
        ) : null}
      </>
    );
  });
  return <>{donationList}</>;
});
