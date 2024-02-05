import { proposalsQuery } from './queries';


export const fetchProposals = async () => {
    try {
        const response = await fetch('https://hub.snapshot.org/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: proposalsQuery }),
        });
        if (response.ok) {
            const data = await response.json();
            if (data.errors) {
                console.error('GraphQL Proposals Error:', data.errors);
                return;
            }
            const fetchedProposals = data.data.proposals;
            return fetchedProposals;


        } else {
            console.error('Error fetching proposals:', await response.text());
        }
    } catch (error) {
        console.error('Error fetching proposals:', error);
    }
};


// map the fetched proposals to check which ones are active
export const mapProposals = (proposals: any) => {
    const activeProposals = proposals.filter((proposal: any) => proposal.state === 'active');
    console.log(activeProposals);
    return activeProposals;

};

// if activeProposals greater than 0, then render a badge with the number of active proposasls 
// else render nothing
