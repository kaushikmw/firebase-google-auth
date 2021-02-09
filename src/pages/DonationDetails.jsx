import React, { memo, useState } from "react";
import GetReferenceDetails from "./GetReferenceDetails";
import { SiConvertio } from "react-icons/si";
import { RiDeleteBin2Fill } from "react-icons/ri";
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
  const [currentCommitment, setCurrentCommitment] = useState(null);
  const [canOpenDeleteDialog, setCanOpenDeleteDialog] = useState(false);

  const handleConvertCommitmentDialogClose = () =>
    setCanOpenConvertDialog(false);

  const handleDeleteCommitmentDialogClose = () => setCanOpenDeleteDialog(false);

  //Delete Commitment
  //Update Commitment amount of the donor
  //If commitment reference is other than the donor then update that donor's totalCollectionCommitment
  const deleteCommitment = async () => {
    console.log("Commitment will be delete!");
    setCanOpenDeleteDialog(false);
    console.log(`Commitment id: ${currentCommitment.id}`);
    await firestore
      .collection("donors")
      .doc(donorDetails.id)
      .collection("donations")
      .doc(currentCommitment.id)
      .delete()
      .then(async () => {
        //Update Commitment amount of the donor
        let donorTotalCommitment = donorDetails.totalCommitment;
        let newDonorTotalCommitment =
          parseInt(donorTotalCommitment) - parseInt(currentCommitment.amount);
        console.log(`newDonorTotalCommitment: ${newDonorTotalCommitment}`);
        await firestore
          .collection("donors")
          .doc(donorDetails.id)
          .update({ totalCommitment: newDonorTotalCommitment });

        //If commitment reference is other than the donor then update that donor's totalCollectionCommitment
        if (currentCommitment.collectedBy !== "Self") {
          let refDonorId = currentCommitment.collectedBy;
          //Get the values of refernce donors total commitment from others and total donations from otheres
          const refDonorDoc = await firestore
            .collection("donors")
            .doc(refDonorId)
            .get();
          if (refDonorDoc.exists) {
            const refDonorData = refDonorDoc.data();
            let totalRefCollection = parseInt(
              refDonorData.totalCommitmentCollection
            );
            let totalRefCommitmentCollection = parseInt(
              refDonorData.totalCommitmentCollection
            );
            console.log(`totalRefCollection: ${totalRefCollection}`);
            console.log(
              `totalRefCommitmentCollection: ${totalRefCommitmentCollection}`
            );
            await firestore
              .collection("donors")
              .doc(refDonorId)
              .update({
                totalCommitmentCollection:
                  totalRefCommitmentCollection -
                  parseInt(currentCommitment.amount),
              });
          } //End of  if (refDonorDoc.exists)
        } //end of if (currentCommitment.collectedBy !== "Self")

        //End of promise
      })
      .catch((e) => {
        console.log(`Error while deleting commitment: ${e}`);
      });
  }; //End of deleteCommitment

  //Converts commitment to donation
  //Checks: Donation date is today or in past
  //Update total donation and commitment
  const convertCommitmentToDonation = async () => {
    setCanOpenConvertDialog(false);
    // console.log(`donationId: ${currentCommitment.id}`);
    // console.log(`currentCommitmentDate: ${currentCommitment.date}`);
    let tDate = new Date();
    let dDate = new Date(currentCommitment.date);
    // console.log(`dDate.getTime(): ${dDate.getTime()}`);
    // console.log(`tDate.getTime(): ${tDate.getTime()}`);
    // console.log(`donorDetails.id: ${donorDetails.id}`);
    // console.log(`Result:  ${dDate.getTime() > tDate.getTime()}`);
    if (dDate.getTime() > tDate.getTime()) {
      //   console.log("Future commitments cannot be converted to donation.");
      alert("Future commitments cannot be converted to donation.");
    } else {
      console.log("Updating donation");
      await firestore
        .collection("donors")
        .doc(donorDetails.id)
        .collection("donations")
        .doc(currentCommitment.id)
        .update({ type: "Donation" })
        .then(async () => {
          //Update total donaiton and total commitment amount of the donor
          let currenttotalDonation = donorDetails.totalDonation;
          let currentTotalCommitment = donorDetails.totalCommitment;
          let donationAmount = currentCommitment.amount;
          let newTotalDonation =
            parseInt(currenttotalDonation) + parseInt(donationAmount);
          let newTotalCommitment =
            parseInt(currentTotalCommitment) - parseInt(donationAmount);
          //   console.log(`currenttotalDonation: ${currenttotalDonation}`);
          //   console.log(`currentTotalCommitment: ${currentTotalCommitment}`);
          //   console.log(`newTotalDonation: ${newTotalDonation}`);
          //   console.log(` newTotalCommitment: ${newTotalCommitment}`);
          await firestore
            .collection("donors")
            .doc(donorDetails.id)
            .update({
              totalDonation:
                parseInt(currenttotalDonation) + parseInt(donationAmount),
              totalCommitment:
                parseInt(currentTotalCommitment) - parseInt(donationAmount),
            })
            .then()
            .catch((e) =>
              console.log(
                `Error while updating donor's total donation after convering the commitment to donation: ${e}`
              )
            );

          //If the donation is collected by other donor, update his total commitment from others and total
          if (currentCommitment.collectedBy !== "Self") {
            let refDonorId = currentCommitment.collectedBy;
            //Get the values of refernce donors total commitment from others and total donations from otheres
            const refDonorDoc = await firestore
              .collection("donors")
              .doc(refDonorId)
              .get();
            if (refDonorDoc.exists) {
              const refDonorData = refDonorDoc.data();
              let totalRefCollection = parseInt(refDonorData.totalCollection);
              let totalRefCommitmentCollection = parseInt(
                refDonorData.totalCommitmentCollection
              );
              console.log(`totalRefCollection: ${totalRefCollection}`);
              console.log(
                `totalRefCommitmentCollection: ${totalRefCommitmentCollection}`
              );
              await firestore
                .collection("donors")
                .doc(refDonorId)
                .update({
                  totalCollection:
                    totalRefCollection + parseInt(donationAmount),
                  totalCommitmentCollection:
                    totalRefCommitmentCollection - parseInt(donationAmount),
                });
            } //End of  if (refDonorDoc.exists)
          } //End oif (currentCommitment.collectedBy !== "Self")
          //End of promise
        })
        .catch((e) => {
          console.log(`Error in converting commitment to donation: ${e}`);
        })
        .finally();
    } //End of if else - if(dDate.getTime() <= tDate.getTime())
  }; //End of convertCommitmentToDonation

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
                      setCurrentCommitment(donation);
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

                  <button
                    className="btn btn-outline"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentCommitment(donation);
                      setCanOpenDeleteDialog(true);
                    }}
                  >
                    <RiDeleteBin2Fill />
                  </button>
                  <MyDialog
                    open={canOpenDeleteDialog}
                    handleClose={handleDeleteCommitmentDialogClose}
                    dialogTitle="Commitment Delete Confirmation"
                    dialogText="Are you sure you want to delete this commitment?"
                    handleDefault={deleteCommitment}
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
