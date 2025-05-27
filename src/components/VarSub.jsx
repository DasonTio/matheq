import React from "react";

const VarSub = ({ name }) => {
  return (
    <>
      {name
        .split(/(\d+)/g)
        .filter(Boolean)
        .map((chunk, i) =>
          /^\d+$/.test(chunk) ? (
            <sub key={i}>{chunk}</sub>
          ) : (
            <React.Fragment key={i}>{chunk}</React.Fragment>
          )
        )}
    </>
  );
};

export default VarSub;
