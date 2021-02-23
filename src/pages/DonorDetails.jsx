import React, { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { firestore } from "../firebase/config";
import { GetUserPrivilages } from "../firebase/UserPrivilageProvider";
// import { useSession } from "../firebase/UserProvider";
// import CommitmentDetails from "./CommitmentDetails";

import DonationDetails from "./DonationDetails";
import GetReferenceDetails from "./GetReferenceDetails";

export default memo(function DonorDetails(props) {
  const { register, setValue, handleSubmit } = useForm();

  const [donations, setDonations] = useState(null);
  const [commitments, setCommitments] = useState(null);
  const [donorRef, setDonorRef] = useState("");
  const [donorDetails, setDonorDetails] = useState({
    fullName: "",
    pan: "",
    email: "",
    phone: "",
    address: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      pin: "",
      state: "",
      country: "",
    },
  });
  const [areThereDonations, thereAreDonations] = useState(false);
  const [areThereCommitments, thereAreCommitments] = useState(false);

  const updateCommitmentDisplayStatus = () => {
    thereAreCommitments(true);
  };

  const privilages = GetUserPrivilages();
  const params = useParams();

  useEffect(async () => {
    const donorId = params.donorId;
    // console.log(`dnorId: ${donorId}`);
    const docRef = firestore.collection("donors").doc(donorId);
    docRef.onSnapshot((snapshot) => {
      if (snapshot.exists) {
        const data = snapshot.data();
        // console.log("donor data:");
        // console.log(data);
        setDonorRef(
          data.reference !== "" || data.reference !== undefined
            ? data.reference
            : ""
        );
        setValue("fullName", data.fullName);
        setValue("pan", data.pan);
        setValue("spiritualName", data.spiritualName);

        setValue("dob", data.dob !== undefined ? data.dob.toDate() : "");
        setValue("email", data.email);
        setValue("phone", data.phone);

        setValue(
          "addressLine1",
          data.address !== "" && data.address !== undefined
            ? data.address.addressLine1
            : ""
        );
        setValue(
          "addressLine2",
          data.address !== "" && data.address !== undefined
            ? data.address.addressLine2
            : ""
        );
        setValue(
          "city",
          data.address !== "" && data.address !== undefined
            ? data.address.city
            : ""
        );
        setValue(
          "pin",
          data.address !== "" && data.address !== undefined
            ? data.address.pin
            : ""
        );

        setValue(
          "state",
          data.address !== "" && data.address !== undefined
            ? data.address.state
            : ""
        );
        setValue(
          "country",
          data.address !== "" && data.address !== undefined
            ? data.address.country
            : ""
        );
        setValue("totalDonation", data.totalDonation);
        setValue("totalCommitment", data.totalCommitment);

        setValue("totalCollection", data.totalCollection);
        setValue("reference", data.reference);
        setValue("totalCommitmentCollection", data.totalCommitmentCollection);
        //Update Donor Details in the context provider
        setDonorDetails({
          id: donorId,
          fullName: data.fullName,
          pan: data.pan,
          email: data.email,
          phone: data.phone,
          address: {
            addressLine1:
              data.address !== "" && data.address !== undefined
                ? data.address.addressLine1
                : "",
            addressLine2:
              data.address !== "" && data.address !== undefined
                ? data.address.addressLine2
                : "",
            city:
              data.address !== "" && data.address !== undefined
                ? data.address.city
                : "",
            pin:
              data.address !== "" && data.address !== undefined
                ? data.address.pin
                : "",
            state:
              data.address !== "" && data.address !== undefined
                ? data.address.state
                : "",
            country:
              data.address !== "" && data.address !== undefined
                ? data.address.country
                : "",
          },
          totalCollection: data.totalCollection,
          totalCommitment: data.totalCommitment,
          totalCommitmentCollection: data.totalCommitmentCollection,
          totalDonation: data.totalDonation,
        });
      } //End of if(snapshot.exists)
    }); //End of const docRef ...

    //Get donations
    await docRef
      .collection("donations")
      .orderBy("date")
      .onSnapshot((snapshot) => {
        //   console.log(snapshot.empty);
        if (!snapshot.empty) {
          // console.log(snapshot.docs);
          let donationDataArray = [];
          snapshot.docs.map((donation) => {
            //   console.log(donation.id);

            const donationData = donation.data();
            //Check the type of donation and set the type accordingly
            // donationData.type === "Donation"
            //   ? thereAreDonations(true)
            //   : thereAreCommitments(true);
            let bankRefDate = new Date(
              donationData.bankRefDate * 1000
            ).toString();
            // console.log(donationData.bankRefDate.toDate());
            donationDataArray.push({
              id: donation.id,
              amount: donationData.amount,
              bank: donationData.bank,
              bankRef: donationData.bankRef,
              bankRefDate:
                donationData.bankRefDate !== "" &&
                donationData.bankRefDate !== undefined
                  ? donationData.bankRefDate.toDate().toString()
                  : "",
              collectedBy: donationData.collectedBy,
              date:
                donationData.date !== "" && donationData.date !== undefined
                  ? donationData.date.toDate().toString()
                  : "",
              trust: donationData.trust,
              mode: donationData.mode,
              type: donationData.type,
            }); //End of donationDataArray.push
          }); //End of snapshot.docs.map
          setDonations(donationDataArray);
        }
      }); //end of await docRef.collection('donations').onSnapshot(snapshot => {
  }, []);

  const updateDonorDetails = async (donorData) => {
    console.log("Data for update");
    console.log(donorData);

    await firestore
      .collection("donors")
      .doc(params.donorId)
      .update({
        fullName: donorData.fullName.toUpperCase(),
        spiritualName: donorData.spiritualName.toUpperCase(),
        email: donorData.email.toUpperCase(),
        phone: donorData.phone,
        address: {
          addressLine1: donorData.addressLine1.toUpperCase(),
          addressLine2: donorData.addressLine2.toUpperCase(),
          city: donorData.city.toUpperCase(),
          pin: donorData.pin,
          state: donorData.state.toUpperCase(),
          country: donorData.country.toUpperCase(),
        },
      })
      .then(() => {
        console.log("Update Success");
        alert("Update successful");
      }); //End of update
  };
  return (
    <div style={{ position: "inherit" }}>
      <div className="card">
        <div className="justify-content-center d-flex">
          <h2>Donor Details</h2>
        </div>
        <form className="" onSubmit={handleSubmit(updateDonorDetails)}>
          <label className="d-flex">
            <h4 className="p-2">Personal Details:</h4>
          </label>
          <div className="row">
            <div className="col-md-6">
              <label className="m-2">Donor Name:</label>
              <input
                type="text"
                className="form-control p-2"
                id="fullName"
                name="fullName"
                ref={register()}
                {...(privilages.canUpdateDonor ? "" : "readOnly")}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">PAN:</label>
              <input
                type="input"
                className="form-control p-2"
                readOnly
                name="pan"
                ref={register()}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Spiritual Name:</label>
              <input
                type="text"
                className="form-control p-2"
                id="dob"
                name="spiritualName"
                ref={register()}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Date of Birth:</label>
              <input
                type="date-time"
                className="form-control p-2"
                readOnly
                name="dob"
                ref={register()}
              />
            </div>
          </div>
          <label className="d-flex">
            <h4 className="p-2">Communication Details:</h4>
          </label>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Email:</label>
              <input
                type="text"
                className="form-control p-2"
                id="email"
                name="email"
                ref={register()}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Phone:</label>
              <input
                type="text"
                className="form-control p-2"
                name="phone"
                ref={register()}
              />
            </div>
          </div>
          <label className="d-flex">
            <h4 className="p-2">Address:</h4>
          </label>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Address Line1:</label>
              <input
                type="text"
                className="form-control p-2"
                id="addressLine1"
                name="addressLine1"
                ref={register()}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Address Line2:</label>
              <input
                type="text"
                className="form-control p-2"
                name="addressLine2"
                ref={register()}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">City:</label>
              <input
                type="text"
                className="form-control p-2"
                id="city"
                name="city"
                ref={register()}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Pin Code:</label>
              <input
                type="text"
                className="form-control p-2"
                name="pin"
                ref={register()}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">State:</label>
              <input
                type="text"
                className="form-control p-2"
                id="state"
                name="state"
                ref={register()}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Country:</label>
              <input
                type="text"
                className="form-control p-2"
                name="country"
                ref={register()}
              />
            </div>
          </div>

          <label className="d-flex">
            <h4 className="p-2">Total Donations:</h4>
          </label>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Total Individual Donation:</label>
              <input
                type="text"
                className="form-control p-2"
                id="totalDonation"
                name="totalDonation"
                readOnly
                ref={register()}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Total Individual Commitment:</label>
              <input
                type="text"
                className="form-control p-2"
                readOnly
                name="totalCommitment"
                ref={register()}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Total Commitment from Others:</label>
              <input
                type="text"
                className="form-control p-2"
                readOnly
                name="totalCommitmentCollection"
                ref={register()}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Total Collection from Others:</label>
              <input
                type="text"
                className="form-control p-2"
                id="totalCollection"
                name="totalCollection"
                readOnly
                ref={register()}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col">
              <label className="m-2">Reference:</label>

              <div>
                <GetReferenceDetails refId={donorRef} />
              </div>
            </div>
          </div>
          <div className="row mb-3 ">
            <div className="col justify-content-center d-flex">
              <button type="submit" className="btn btn-primary">
                Update Details
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="mt-3">
        <div className="justify-content-center d-flex">
          <h2>Donation Details</h2>
        </div>
        <div className="justify-content-center d-flex">
          <Link to={`/acceptdonation/Donation/${params.donorId}`}>
            Accept New Donation
          </Link>
          {/* <button className="btn btn-link ">Accept New Donation</button> */}
        </div>
        {donations ? (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Donation Date</th>
                  <th>Amount</th>
                  <th>Bank</th>
                  <th>Bank Reference</th>
                  <th>Bank Refence Date</th>
                  <th>Coolected by</th>
                  <th>To Trust</th>
                  <th>Mode</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                <DonationDetails
                  donations={donations}
                  donorDetails={donorDetails}
                  donationType="Donation"
                />
              </tbody>
            </table>
          </div>
        ) : (
          <div className="justify-content-center d-flex">
            <h3>No donations</h3>
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="justify-content-center d-flex">
          <h2>Commitment Details</h2>
        </div>
        <div className="justify-content-center d-flex">
          <Link to={`/acceptdonation/Commitment/${params.donorId}`}>
            Accept New Commitments
          </Link>
          {/* <button className="btn btn-link ">Accept New Donation</button> */}
        </div>
        {donations ? (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Donation Date</th>
                  <th>Amount</th>
                  <th>Bank</th>
                  <th>Bank Reference</th>
                  <th>Bank Refence Date</th>
                  <th>Coolected by</th>
                  <th>To Trust</th>
                  <th>Mode</th>
                  <th>Action</th>
                </tr>
              </thead>
              {/* <tbody>
                <CommitmentDetails commitments={commitments} />
              </tbody> */}
              <tbody>
                <DonationDetails
                  donations={donations}
                  donorDetails={donorDetails}
                  donationType="Commitment"
                />
              </tbody>
            </table>
          </div>
        ) : (
          <div className="justify-content-center d-flex">
            <h3>No commitments</h3>
          </div>
        )}
      </div>
    </div>
  );
});
