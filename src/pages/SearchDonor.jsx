import React, { memo, useState,  } from 'react'
import { firestore } from '../firebase/config';
import DonorList from './DonorList';
// import DonorList from './DonorList';

export default memo(function SearchDonor() {
    const [donorName, setDonorName] = useState('');
    const [pan, setPan] = useState('');

    const[queryResult, setQueryResult] = useState(null);
    return (
        <div>
            <div className='justify-content-center d-flex'>
                <h2>Search Donor</h2>
            </div>
            <div className="row justify-content-center d-flex">
                
                <form className="form-inline " onSubmit= {async e =>  {
                    e.preventDefault();
                    console.log(`donorName: ${donorName}`);
                    console.log(`pan: ${pan}`);
                    const query = firestore.collection(`donors`)
                         .where('pan', '>=', pan);
                     const snapshot  = await query.get({source: 'server'})
                    .then(QuerySnapshot  => {
                        console.log('querySnapshot');console.log(QuerySnapshot);
                         let donorList = [];                       
                        QuerySnapshot.forEach(donor => {
                            donorList.push({
                                donorId: donor.id,
                                fullName: donor.data().fullName,
                                pan: donor.data().pan,
                            });
                        });//End of QuerySnapshot.forEach

                         setQueryResult(donorList);                         
                     });
                     
                     
                }}>

                        {/* <label className='ml-2' for="donorName">Donor Name:</label>
                        <input type="text" className="form-control m-2" id="donorName" 
                        placeholder="Enter donor name here" name="donorName"
                        onChange={(e) => setDonorName(e.target.value)}/> */}

                        <label className='ml-2'>PAN No:</label>
                        <input type="text" className="form-control m-2" id="pan" 
                        placeholder="Enter PAN" name="pan" 
                        onChange = {(e) => setPan(e.target.value)}/>

                        <button type="submit" className="btn btn-primary m-2">Search</button>
                    
                </form> 
                              
            </div>
            <div className='card border-top-0 rounded-0'>
                <div className="card-body py-2 justify-content-center d-flex">
                    <div className="card-title font-weight-bold m-0">
                    Result
                    </div>
                </div>    
            </div>
            {queryResult != null && <div className='card border-top-0 rounded-0'>
                <div className="card-body py-2 justify-content-center d-flex">
                    <div className="card-title font-weight-bold m-0">
                        {/* <DonorList queryResult={queryResult} /> */}
                        Query Results here..
                        <DonorList queryResult={queryResult} />                                              
                    </div>
                </div>    
            </div>}
        </div>
    )
})
