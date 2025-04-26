import React from "react";
import { Select, Option, ThemeProvider } from "@material-tailwind/react";

const GradePick = ({ value, onChange }) => {
  const theme = {
    select: {
      styles: {
        base: {
          container: {
            position: "relative",
            width: "w-full",
            minWidth: "min-w-[120px]",
          },
        },
      },
    },
  };

  return (
    <ThemeProvider value={theme}>
      <div className="">
        <Select
          label="Select grade"
          value={value}
          onChange={(val) => onChange(val)}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <Option key={i + 1} value={i + 1}>
              Grade {i + 1}
            </Option>
          ))}
        </Select>
      </div>
    </ThemeProvider>
  );
};

export default GradePick;
