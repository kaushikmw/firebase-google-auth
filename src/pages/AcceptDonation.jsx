import React, { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { firestore } from "../firebase/config";
import { GetUserPrivilages } from "../firebase/UserPrivilageProvider";
import { AiOutlineSearch } from "react-icons/ai";
import { ErrorMessage } from "@hookform/error-message";

export default memo(function AcceptDonation(props) {
  const { register, setValue, errors, handleSubmit } = useForm();
  const privilages = GetUserPrivilages;
  const params = useParams();
  const history = useHistory();

  const [donorRef, setDonorRef] = useState(""); //Store donor ref's id
  const [isLoading, setisLoading] = useState(false);
  const [totalDonation, setTotalDonation] = useState(0); //Total Donation
  const [totalCommitment, setTotalCommitment] = useState(0); //Total Commitment
  const [donorRefSearchQuery, setDonorRefSearchQuery] = useState(""); //To store the query string of other donor ref
  const [donorRefList, setDonorRefList] = useState(null); //To store the result of donor ref search
  const [donorRefOption, setDonorRefOption] = useState("selfDonor");
  const [donorRefError, setDonorRefError] = useState(false);
  const [donationMode, setDonationMode] = useState("Cheque");
  const [type, setType] = useState(""); //To store donation type
  const [dateError, setDateError] = useState(false);

  const handleModeChange = (e) => {
    setDonationMode(e.target.value);
  };

  const updateDonorRefValue = (donorRefId, donorRefFullName) => {
    setDonorRef(donorRefId);
    setDonorRefList(null);
    setDonorRefSearchQuery(donorRefFullName);
  };

  const handleCollectedByOptions = (e) => {
    setDonorRefOption(e.target.value);
  }; //End of handleCollectedByOptions function

  const handleDonorRefSearch = async (e) => {
    e.preventDefault();
    setDonorRefError(false);
    console.log("in handleDonorRefSearch");
    const query = firestore
      .collection(`donors`)
      .where("fullName", ">=", donorRefSearchQuery)
      .orderBy("fullName")
      .limit(3);
    // console.log('first:');
    // console.log(firstQuery);
    const snapshot = await query
      .get({ source: "server" })
      .then((querySnapshot) => {
        let donorRefList = [];
        console.log("querySnapshot");
        console.log(querySnapshot);
        querySnapshot.forEach((donorRef) => {
          console.log(`Donor Ref Name: ${donorRef.data().fullName}`);
          donorRefList.push({
            donorId: donorRef.id,
            fullName: donorRef.data().fullName,
          });
        }); //End of querySnapshot.forEach()
        setDonorRefList(donorRefList);
      }); //End of then(querySnapshot => {})
  }; //end of const handleDonorRefSearch

  useEffect(() => {
    const donorId = params.donorId;
    setType(params.type);
    const docRef = firestore.collection("donors").doc(donorId);
    docRef.onSnapshot((snapshot) => {
      if (snapshot.exists) {
        const data = snapshot.data();
        // setDonorRef(data.reference);
        setTotalDonation(
          data.totalDonation !== "" && data.totalDonation !== undefined
            ? data.totalDonation
            : 0
        );
        setTotalCommitment(
          data.totalCommitment !== "" && data.totalCommitment !== undefined
            ? data.totalCommitment
            : 0
        );
        setValue("fullName", data.fullName);
        setValue("pan", data.pan);
        setValue("spiritualName", data.spiritualName);

        setValue(
          "dob",
          data.dob !== "" && data.dob !== undefined ? data.dob.toDate() : ""
        );
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

        setValue("reference", data.reference);
      } //End of if(snapshot.exists)
    }); //End of const docRef ...
  }, []); //End of useEffect

  const acceptDonation = async (donationData) => {
    let canProcess = false;
    console.log(donationData);

    //If the donor ref is self
    let donorReference = "";
    //The other option is selected but ref is not selected yet
    if (donorRefOption === "otherDonor" && donorRef === "") {
      setDonorRefError(true);
      // donorReference = params.donorId;
    } else {
      //Check for valid donation date based on the type
      //if type = Donation, date should today or in past
      //else date should be in future
      let tDate = new Date();
      let dDate = new Date(donationData.date);
      if (type === "Donation" && dDate.getTime() <= tDate.getTime()) {
        canProcess = true;
      } else if (type === "Commitment" && dDate.getTime() > tDate.getTime()) {
        canProcess = true;
      } else {
        setDateError(true);
      }
    } //End of else if(donorRefOption === 'selfDonor')
    if (canProcess) {
      setisLoading(true);
      if (donorRefOption === "otherDonor") {
        //If donor ref is other and selected a valid donor
        donorReference = donorRef;
      } else if (donorRefOption === "selfDonor") {
        //If donor ref is self, set the value as self
        donorReference = "Self";
      }

      await firestore
        .collection("donors")
        .doc(params.donorId)
        .collection("donations")
        .add({
          amount: donationData.amount,
          bank: donationData.bank !== undefined ? donationData.bank : "",
          bankRef: donationData.bankRef !== undefined ? donationData.bank : "",
          bankRefDate:
            donationData.bankRefDate !== undefined
              ? new Date(donationData.bankRefDate)
              : "",
          collectedBy: donorReference,
          date: new Date(donationData.date),
          mode: donationData.mode,
          trust: donationData.trust,
          created: new Date(),
          type: type,
        })
        .then(async (res) => {
          //Update the total donation or commitment amount of the donor as per the type value
          if (type === "Donation") {
            await firestore
              .collection("donors")
              .doc(params.donorId)
              .update({
                totalDonation:
                  parseInt(totalDonation) + parseInt(donationData.amount),
              });
          } else {
            await firestore
              .collection("donors")
              .doc(params.donorId)
              .update({
                totalCommitment:
                  parseInt(totalCommitment) + parseInt(donationData.amount),
              });
          }

          //If the collected by other then update that other person's total collection
          if (
            donorRefOption === "otherDonor" &&
            donorReference !== params.donorId
          ) {
            //Get his total collection
            const donorRef = firestore.collection("donors").doc(donorReference);
            const donorRefDoc = await donorRef.get();
            if (donorRefDoc.exists) {
              console.log(donorRefDoc.data());
              let donorRefTotalCollection = donorRefDoc.data().totalCollection;
              let donorRefTotalCommitmentCollection = donorRefDoc.data()
                .totalCommitmentCollection;
              //Update the total collection
              if (type === "Donation") {
                await firestore
                  .collection("donors")
                  .doc(donorReference)
                  .update({
                    totalCollection:
                      parseInt(donorRefTotalCollection) +
                      parseInt(donationData.amount),
                  });
              } else {
                await firestore
                  .collection("donors")
                  .doc(donorReference)
                  .update({
                    totalCommitmentCollection:
                      parseInt(donorRefTotalCommitmentCollection) +
                      parseInt(donationData.amount),
                  });
              }
            } //end of if(donorRefDoc.exists)
          } //end of if(donorRefOption === 'otherDonor' && donorReference !== params.donorId)
          setisLoading(false);
          console.log(`result id: ${res.id}`);
          history.push(`/donordetails/${params.donorId}`); //Navigate back to donor details
        });
    } //End of if(canProcess)
  }; //End of acceptDonation
  const formClass = `${isLoading ? "ui form loading" : ""}`;
  return (
    <div>
      <div className="card">
        <div className="justify-content-center d-flex">
          <h2>Accpet {type}</h2>
        </div>
        <form className={formClass} onSubmit={handleSubmit(acceptDonation)}>
          <label className="d-flex">
            <h4>Personal Details:</h4>
          </label>
          <div className="row">
            <div className="col">
              <label className="m-2">Donor Name:</label>
              <input
                type="text"
                className="form-control ml-2"
                id="fullName"
                name="fullName"
                ref={register()}
                readOnly
              />
            </div>
            <div className="col">
              <label className="m-2">PAN:</label>
              <input
                type="input"
                className="form-control mr-2  p-2"
                ref={register()}
                readOnly
                name="pan"
              />
            </div>
          </div>
          <label className="d-flex">
            <h4>Communication Details:</h4>
          </label>
          <div className="row mb-3">
            <div className="col">
              <label className="m-2">Email:</label>
              <input
                type="text"
                className="form-control ml-2"
                id="email"
                name="email"
                ref={register()}
                readOnly
              />
            </div>
            <div className="col">
              <label className="m-2">Phone:</label>
              <input
                type="text"
                className="form-control p-2"
                name="phone"
                readOnly
                ref={register()}
              />
            </div>
          </div>
          <label className="d-flex">
            <h4>Address:</h4>
          </label>
          <div className="row mb-3">
            <div className="col">
              <label className="m-2">Address Line1:</label>
              <input
                type="text"
                className="form-control ml-2"
                id="addressLine1"
                name="addressLine1"
                readOnly
                ref={register()}
              />
            </div>
            <div className="col">
              <label className="m-2">Address Line2:</label>
              <input
                type="text"
                className="form-control p-2"
                name="addressLine2"
                readOnly
                ref={register()}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col">
              <label className="m-2">City:</label>
              <input
                type="text"
                className="form-control ml-2"
                id="city"
                name="city"
                readOnly
                ref={register()}
              />
            </div>
            <div className="col">
              <label className="m-2">Pin Code:</label>
              <input
                type="text"
                className="form-control p-2"
                name="pin"
                readOnly
                ref={register()}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col">
              <label className="m-2">State:</label>
              <input
                type="text"
                className="form-control ml-2"
                id="state"
                name="state"
                readOnly
                ref={register()}
              />
            </div>
            <div className="col">
              <label className="m-2">Country:</label>
              <input
                type="text"
                className="form-control p-2"
                name="country"
                readOnly
                ref={register()}
              />
            </div>
          </div>
          <label className="d-flex">
            <h4>Donation Details:</h4>
          </label>
          <div className="row mb-3">
            <div className="col">
              <label className="m-2">Amount:</label>
              <input
                type="number"
                className="form-control p-2"
                name="amount"
                ref={register({
                  required: `Please enter a ${type} amount`,
                  min: {
                    value: 1,
                    message: `Minimum ${type} amount should be more than zero`,
                  },
                  validate: {
                    cashValidation: (value) =>
                      donationMode === "Cash" ? value < 2001 : true,
                  },
                })}
              />
              {errors.amount?.type === "cashValidation" && (
                <p className="text-danger">
                  You cannot accept more than Rs 2000 as cash
                </p>
              )}
              <ErrorMessage
                errors={errors}
                name="amount"
                render={({ message }) => (
                  <p className="text-danger">{message}</p>
                )}
              />
            </div>
            <div className="col">
              <label className="m-2">{type} Date:</label>
              <input
                type="date"
                className="form-control p-2"
                name="date"
                ref={register({
                  required: `Please enter ${type} date.`,
                })}
                onChange={(e) => {
                  setDateError(false);
                }}
              />
              {dateError &&
                (type === "Donation" ? (
                  <p className="text-danger">
                    Donation cannot be acepted for future date.
                  </p>
                ) : (
                  <p className="text-danger">
                    Commitment cannot be taken of past date or today.
                  </p>
                ))}
              <ErrorMessage
                errors={errors}
                name="date"
                render={({ message }) => (
                  <p className="text-danger">{message}</p>
                )}
              />
            </div>
            <div className="col">
              <label className="m-2">Mode:</label>
              <br />
              <div className="row">
                <div className="col">
                  <input
                    type="radio"
                    id="Cheque"
                    name="mode"
                    value="Cheque"
                    ref={register({
                      required: `Please select ${type} mode.`,
                    })}
                    onChange={handleModeChange}
                    checked={donationMode === "Cheque"}
                  />{" "}
                  <label for="Cheque">Cheque</label>
                  <br />
                  {type === "Donation " && (
                    <span>
                      <input
                        type="radio"
                        id="DD"
                        name="mode"
                        value="DD"
                        ref={register({
                          required: `Please select ${type} mode.`,
                        })}
                        onChange={handleModeChange}
                        checked={donationMode === "DD"}
                      />{" "}
                      <label for="DD">DD</label>
                    </span>
                  )}
                </div>
                <div className="col">
                  {type === "Donation" && (
                    <span>
                      <input
                        type="radio"
                        id="NEFT"
                        name="mode"
                        value="NEFT"
                        ref={register({
                          required: `Please select ${type} mode.`,
                        })}
                        onChange={handleModeChange}
                        checked={donationMode === "NEFT"}
                      />{" "}
                      <label for="NEFT">NEFT</label>
                      <br />
                    </span>
                  )}
                  <input
                    type="radio"
                    id="Cash"
                    name="mode"
                    value="Cash"
                    ref={register({
                      required: `Please select ${type} mode.`,
                    })}
                    onChange={handleModeChange}
                    checked={donationMode === "Cash"}
                  />{" "}
                  <label for="Cash">Cash</label>
                  <br />
                  <ErrorMessage
                    errors={errors}
                    name="mode"
                    render={({ message }) => (
                      <p className="text-danger">{message}</p>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          {donationMode !== "Cash" && donationMode !== "Other" && (
            <div className="row mb-3">
              <div className="col">
                <label className="m-2">Bank Name:</label>
                <input
                  type="text"
                  className="form-control"
                  id="bank"
                  name="bank"
                  ref={register({
                    required: "Please enter bank name",
                  })}
                />
                <ErrorMessage
                  errors={errors}
                  name="bank"
                  render={({ message }) => (
                    <p className="text-danger">{message}</p>
                  )}
                />
              </div>
              <div className="col">
                <label className="m-2">{donationMode} Reference:</label>
                <input
                  type="text"
                  className="form-control ml-2"
                  id="bankRef"
                  name="bankRef"
                  ref={register({
                    required: `Please enter ${donationMode} reference.`,
                  })}
                />
                <ErrorMessage
                  errors={errors}
                  name="bankRef"
                  render={({ message }) => (
                    <p className="text-danger">{message}</p>
                  )}
                />
              </div>
              <div className="col">
                <label className="m-2">{donationMode} Date:</label>
                <input
                  type="date"
                  className="form-control ml-2"
                  id="bankRefDate"
                  name="bankRefDate"
                  ref={register({
                    required: `Please enter ${donationMode} date`,
                  })}
                />
                <ErrorMessage
                  errors={errors}
                  name="bankRefDate"
                  render={({ message }) => (
                    <p className="text-danger">{message}</p>
                  )}
                />
              </div>
            </div>
          )}
          <label className="d-flex">
            <h4>Additional Details:</h4>
          </label>
          <div className="row mb-3">
            <div className="col">
              <label className="m-2">To Trust:</label>
              <br></br>
              <input
                type="radio"
                id="SCSS"
                name="trust"
                value="SCSS"
                ref={register({
                  required: `Please select the trust to which the ${type} is made.`,
                })}
              />{" "}
              <label for="SCSS">Sri Chaitanya Shikshan Sanstha</label>
              <br />
              <input
                type="radio"
                id="CREST"
                name="trust"
                value="CREST"
                ref={register({
                  required: `Please select the trust to which the ${type} is made.`,
                })}
              />{" "}
              <label for="CREST">
                Chaitanya Research & Edcational Services Trust
              </label>{" "}
              <br />
              <ErrorMessage
                errors={errors}
                name="trust"
                render={({ message }) => (
                  <p className="text-danger">{message}</p>
                )}
              />
            </div>
            <div className="col">
              <label className="m-2">Collected By:</label>
              <br />
              <input
                type="radio"
                id="selfDonor"
                name="collectedBy"
                value="selfDonor"
                checked={donorRefOption === "selfDonor"}
                onChange={handleCollectedByOptions}
              />{" "}
              <label for="selfDonor">Self</label>
              <br />
              <input
                type="radio"
                id="otherDonor"
                name="collectedBy"
                value="otherDonor"
                checked={donorRefOption === "otherDonor"}
                onChange={handleCollectedByOptions}
              />{" "}
              <label for="otherDonor">Other</label>
            </div>
            <div className="col">
              {donorRefOption === "otherDonor" ? (
                <div>
                  <label className="m-2">
                    If collected by is "Other", please search the same here
                  </label>
                  <br />
                  <input
                    placeholder="Search Here"
                    name="searchRef"
                    value={donorRefSearchQuery}
                    onChange={(e) => setDonorRefSearchQuery(e.target.value)}
                  />
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={handleDonorRefSearch}
                  >
                    <AiOutlineSearch />
                  </button>
                  <br />
                  {donorRefList && (
                    <DonorRefList
                      queryList={donorRefList}
                      updateDonorRefValue={updateDonorRefValue}
                    />
                  )}
                </div>
              ) : (
                ""
              )}
              {donorRefError && (
                <div className="text-danger">
                  Please select a reference for the {type}
                </div>
              )}
            </div>
          </div>
          <div className="row mb-3 ">
            <div className="col justify-content-center d-flex">
              <button type="submit" className="btn btn-primary mr-2">
                Accept {type}
              </button>{" "}
              <button
                type="button"
                className="btn btn-secondary ml-2"
                onClick={(e) => {
                  e.preventDefault();
                  history.push(`/donordetails/${params.donorId}`);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
});

export const DonorRefList = (props) => {
  const donorRefQueryList = props.queryList;

  const donorRefList = donorRefQueryList.map((donorRef) => {
    return (
      <>
        <div className="list-group-item d-flex list-group-item-info">
          <button
            className="btn btn-link"
            onClick={(e) => {
              e.preventDefault();
              props.updateDonorRefValue(donorRef.donorId, donorRef.fullName);
            }}
            key={donorRef.donorId}
          >
            {donorRef.fullName}
          </button>
        </div>
      </>
    );
  });

  return <div>{donorRefList}</div>;
};
