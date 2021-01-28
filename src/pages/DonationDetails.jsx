import React, { memo } from 'react'
import GetReferenceDetails from './GetReferenceDetails'

export default memo(function DonationDetails({donations}) {
    // const donationData = donations;

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
            </tr>
        );
    })
    return (
        <>
            {donationList}
        </>
    )
})
