import React from "react";
import "./App.css";
import faker from "faker";
import ScrollTable from "./ScrollTable";

const DATA_LENGTH = 34;
const PAGE_LENGTH = 5;

const columns = [{ key: "id", Component: (d) => <div>{d}</div> }];

function makeData() {
  const arr = new Array(DATA_LENGTH).fill(null);
  const data = arr.map((item, index) => {
    return {
      id: index + 1,
      name: faker.name.findName(),
      phone: faker.phone.phoneNumber(),
      email: faker.internet.email(),
      description: faker.lorem.sentences(Math.ceil(Math.random() * 10)),
    };
  });
  return data;
}

const data = makeData();

function App() {
  return <ScrollTable columns={columns} data={data} pageLength={PAGE_LENGTH} />;
}

export default App;
