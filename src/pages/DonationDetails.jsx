import React, { memo } from 'react'
import GetReferenceDetails from './GetReferenceDetails'
import {
    PDFViewer,
    PDFDownloadLink,
    Document,
    Page,
    ReactPDF
  } from "@react-pdf/renderer";
import DonationReceipt from './DonationReceipt';
export default memo(function DonationDetails({donations,donorDetails}) {
    // const donationData = donations;
    const pdfFile = React.createRef();
    const donationList = donations.map(donation => {
        return(
            <tr key={donation.id}>
                <td>{donation.date}</td>
                <td>{donation.amount}</td>
                <td>{donation.bank}</td>
                <td>{donation.bankRef}</td>
                <td>{donation.bankRefDate}</td>
                {/* <td>{donation.collectedBy}</td> */}
                <td><GetReferenceDetails refId={donation.collectedBy} /></td>
                <td>{donation.trust}</td>
                <td>{donation.mode}</td>
                <td><PDFDownloadLink
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
                </PDFDownloadLink></td>
            </tr>
        );
    })
    return (
        <>
            {donationList}
        </>
    )
})
