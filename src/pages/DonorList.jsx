import React, { memo} from 'react'
import { Link } from 'react-router-dom'

export default memo(function DonorList({queryResult}) {
    
    
    const donorList = queryResult.map( donor => {
        return(
            <div className="list-group-item d-flex list-group-item-info" key={donor.donorId}>
                
                <section className="btn-group align-self-center" role="group">
                   <Link className = '' to={`/donordetails/${donor.donorId}`} > {donor.fullName}</Link>
                   
                </section>{' '}
                <section className="btn-group align-self-center" role="group">
                    {donor.pan}
                </section>
            </div>
        );
    });
    return (
        <div>
            {donorList}
        </div>
    )
})
