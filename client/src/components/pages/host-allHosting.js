import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Container, Row, Table, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const HostHosting = () => {
  const [allHostingList, setAllHostingList] = useState([]);

  useEffect(() => {
    axios
      .get("/hosts/upcoming", { withCredentials: true })
      .then((response) => {
        // console.log("all hosting list", response.data);
        setAllHostingList(response.data);
      })
      .catch((error) => {
        console.log(error.response);
      });
  }, []);

  const displayAllEvents = allHostingList.map((room, index) => {
    const eventDate = dayjs(room.eventStart).format("DD/MM/YYYY");
    const eventTime = dayjs(room.eventStart).format("HH:mm");

    return (
      <tr key={room._id}>
        <td className="text-center">{index + 1}</td>
        <td>
          <Link to={`/host/${room._id}`}>{room.eventName}</Link>
        </td>
        <td className="text-center">{eventDate}</td>
        <td className="text-center">{eventTime}</td>
        <td className="text-center">{room.roomCode}</td>
        <td className="text-center">
          <Link to={`/host/${room._id}/edit`}>
            <Button variant="danger" id={room._id}>
              Edit Event
            </Button>
          </Link>
        </td>
        <td className="text-center">
          <Link to={`/host/${room._id}`}>
            <Button>Start Event</Button>
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <Container>
      <Row className="justify-content-md-center">
        <h1>Upcoming Events</h1>
      </Row>
      <Row>
        <br />
      </Row>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th className="text-center">S/N</th>
            <th className="text-center">Event Name</th>
            <th className="text-center">Event Date</th>
            <th className="text-center">Event Time</th>
            <th className="text-center">Room Code</th>
            <th colSpan="2" className="text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>{displayAllEvents}</tbody>
      </Table>
    </Container>
  );
};

export default HostHosting;
