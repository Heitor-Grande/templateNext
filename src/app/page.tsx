"use client"

import { Select } from "@/components/inputs/select";


export default function Home() {
  const options = [
    { label: "São Paulo", value: "SP" },
    { label: "Rio de Janeiro", value: "RJ" },
    { label: "Minas Gerais", value: "MG" },
  ];

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-3">
          <Select
            id={"teste"}
            label={"Pesquisar"}
            options={options}
            value={{ label: "", value: "" }}
            onChange={function (e) {

            }}
            placeholder={"Pesquisar aqui..."}
            isDisabled={false}
            isClearable={true}
            className=""
          />
        </div>
      </div>

    </div>
  );
}
