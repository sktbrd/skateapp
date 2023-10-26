import { useState, useEffect } from "react";
import { Box, Text } from "@chakra-ui/react";
import axios from "axios"; // Import Axios

interface Submission {
    id: number;
    title: string;
    author: string;
    createdAt: string;
}

const ThatsGnarly = () => {
    console.log("Access thatsgnarly api");
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const response = await axios.get(
                    "https://thatsgnar.ly/routes/submissions?page=5&take=3&filter=new&period=all&scopeId=thatsgnarly"
                );
                const data = response.data;
                setSubmissions(data);
                console.log(response);
            } catch (error) {
                console.error("Error fetching submissions:", error);
            }
        };

        fetchSubmissions();
    }, []);

    return (
        <Box>
            {submissions.map((submission) => (
                <Box key={submission.id} borderWidth="1px" borderRadius="lg" p="4">
                    <Text fontWeight="bold">{submission.title}</Text>
                    <Text>Author: {submission.author}</Text>
                    <Text>Created At: {submission.createdAt}</Text>
                </Box>
            ))}
        </Box>
    );
};

export default ThatsGnarly;
