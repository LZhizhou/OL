import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Line, LineConfig, Column, ColumnConfig } from "@ant-design/plots";
import Price, { PriceType } from "./types/price";
import { priceApi } from "./api/price";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

function addDays(date: Date, days: number) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const priceTypes: PriceType[] = ["open", "close", "high", "low"];
type PriceMap = Map<Date, Price>;
function App() {
  const [prices, setPrices] = useState<PriceMap>(new Map());
  const [type, setType] = useState<PriceType>("open");
  const [histogramDate, setHistogramDate] = useState<Date>();
  const [histogramStartDate, setHistogramStartDate] = useState<Date>();
  const [histogramEndDate, setHistogramEndDate] = useState<Date>();
  const [histogram, setHistogram] = useState<
    { range: string; count: number }[]
  >([]);

  const lineConfig: LineConfig = {
    data: Array.from(prices.values()),
    padding: "auto",
    xField: "date",
    yField: type,
    autoFit: true,
    xAxis: {
      nice: true,
      tickMethod: "time-pretty",
    },
    yAxis: {
      nice: true,
    },
    slider: {
      start: prices ? (prices.size - 30) / prices.size : 0,
      end: 1,
    },
    meta: {
      date: {
        type: "time",
      },
      open: { nice: true },
    },
    interactions: [],
  };
  const columnConfig: ColumnConfig = {
    data: histogram,
    xField: "range",
    yField: "count",
    xAxis: {
      nice: true,
    },
    yAxis: {
      nice: true,
    },
  };

  useEffect(() => {
    priceApi.getPrices().then((prices) => {
      setPrices(
        new Map(
          prices.map((price) => {
            return [new Date(price.date), price];
          })
        )
      );
      setHistogramStartDate(new Date(prices[0].date));
      setHistogramEndDate(new Date(prices[prices.length - 1].date));
      setHistogramDate(new Date(prices[prices.length - 1].date));
    });
  }, []);

  useEffect(() => {
    if (histogramDate) {
      const priceList: number[] = [];
      const start = addDays(histogramDate, -30);
      Array.from(prices.keys())
        .filter((date) => {
          return date >= start && date <= histogramDate;
        })
        .forEach((element) => {
          const price = prices.get(element)?.[type];
          if (price) {
            priceList.push(price);
          }
        });
      priceList.sort();

      const histogram = new Map<number, number>();
      const maxValue = Math.floor(priceList[priceList.length - 1]);
      const minValue = Math.ceil(priceList[0]);
      const step = Math.ceil((maxValue - minValue) / 8);
      priceList.forEach((value) => {
        const key = Math.floor((value - minValue) / step);
        if (histogram.has(key)) {
          histogram.set(key, histogram.get(key)! + 1);
        } else {
          histogram.set(key, 1);
        }
      });
      setHistogram(
        Array.from(histogram.keys()).map((key) => {
          return {
            range: `${minValue + key * step} - ${minValue + (key + 1) * step}`,
            count: histogram.get(key) || 0,
          };
        })
      );
    }
  }, [histogramDate, prices, type]);

  return (
    <Card>
      <CardHeader
        title="Price of Lumber Futures"
        action={
          <Select
            value={type}
            onChange={(event) => {
              setType(event.target.value as PriceType);
            }}
          >
            {priceTypes.map((priceType) => (
              <MenuItem key={priceType} value={priceType}>
                {priceType}
              </MenuItem>
            ))}
          </Select>
        }
      />
      <CardContent>{prices && <Line {...lineConfig} />}</CardContent>
      <CardHeader
        title="30 days of price distribution"
        action={
          histogramStartDate && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={histogramDate}
                onChange={(newValue) => {
                  if (newValue) {
                    setHistogramDate(newValue);
                  }
                }}
                minDate={addDays(histogramStartDate, 30)}
                maxDate={histogramEndDate}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          )
        }
      />
      <CardContent>
        <Column {...columnConfig} />
      </CardContent>
    </Card>
  );
}

export default App;
