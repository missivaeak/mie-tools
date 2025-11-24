import { useState } from "react";
import { Temporal } from 'temporal-polyfill';
import InputText from "../components/InputText";
import InputSelect from "../components/InputSelect";
import epochConfig from './configs/epochConfig.json';

const precisions = ["second", "millisecond", "microsecond", "nanosecond"] as const;
type Precision = typeof precisions[number];

const precisionMap: Record<Precision, number> = {
  second: 10,
  millisecond: 13,
  microsecond: 16,
  nanosecond: 19
};

type EpochState = {
  timestamp: string;
  year: string;
  month: string;
  day: string;
  time: string;
  dateTimeString: string;
  timeZone: string;
  precision: Precision;
};

const defaultState = `{
  "timestamp": "0",
  "year": "1970",
  "month": "01",
  "day": "01",
  "time": "00:00:00",
  "timeZone": "Etc/UCT",
  "precision": "millisecond"
}`;

const timeZones = [...epochConfig.selectTimezones, ...epochConfig.timezones];

export default function EpochTool() {
  const storedState: EpochState = JSON.parse(localStorage.getItem('epochState') ?? defaultState);
  const [timestamp, setTimestamp] = useState(storedState.timestamp);
  const [year, setYear] = useState(storedState.year);
  const [month, setMonth] = useState(storedState.month);
  const [day, setDay] = useState(storedState.day);
  const [time, setTime] = useState(storedState.time);
  const [dateTimeString, setDateTimeString] = useState(storedState.dateTimeString)
  const [precision, setPrecision] = useState<Precision>(storedState.precision);
  const [timeZone, setTimeZone] = useState(storedState.timeZone);

  const updateState = function(update: Partial<EpochState>) {
    const keyCallbackMap = {
      timestamp: setTimestamp,
      year: setYear,
      month: setMonth,
      day: setDay,
      time: setTime,
      dateTimeString: setDateTimeString,
      precision: setPrecision,
      timeZone: setTimeZone
    }

    Object.entries(update).forEach(([key, value]) => {
      // @ts-expect-error
      storedState[key] = value;
      // @ts-expect-error
      keyCallbackMap[key](value)
    });

    localStorage.setItem('epochState', JSON.stringify(storedState));
  }

  const zdtToDateTimeString = function(zdt: Temporal.ZonedDateTime, precision: Precision) {
    const pdt = zdt.round(precision).toPlainDateTime()
    const offset = zdt.offset;

    return `${pdt}${offset}`;
  }

  const zdtToPickerStrings = function(zdt: Temporal.ZonedDateTime) {
    const { year, month, day, hour, minute, second } = zdt;
    return {
      year: year.toString().padStart(4, "0"),
      month: month.toString().padStart(2, "0"),
      day: day.toString().padStart(2, "0"),
      time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`,
    }
  }

  const timestampToInstant = function(timestamp: string) {
    const nanosecondString = timestamp.padEnd(19, "0").slice(0, 19);
    const nanosecondBigInt = BigInt(nanosecondString);

    return new Temporal.Instant(nanosecondBigInt);
  }

  const instantToTimestamp = function(instant: Temporal.Instant, precision: Precision) {
    const timestampLength = precisionMap[precision];
    return instant.epochNanoseconds.toString().slice(0, timestampLength);
  }

  const updateTimestamp = function(timestamp: string) {
    const roundedTimestamp = timestamp.slice(0, precisionMap['nanosecond']);
    const precision = precisions.find((precision) => roundedTimestamp.length <= precisionMap[precision]) ?? "nanosecond";

    try {
      const instant = timestampToInstant(roundedTimestamp)
      const zdt = instant.toZonedDateTimeISO(timeZone);
      const dateTimeString = zdtToDateTimeString(zdt, precision);
      const pickerStrings = zdtToPickerStrings(zdt);

      updateState({
        precision,
        timestamp: roundedTimestamp,
        dateTimeString,
        ...pickerStrings
      });
    } catch (error) {
      console.warn(error);
      updateState({
        timestamp: roundedTimestamp
      })
    }
  }

  const updatePicker = function(partialUpdate: Partial<Pick<EpochState, 'year' | 'month' | 'day' | 'time'>>) {
    try {
      const [hour, minute, second] = (partialUpdate.time ?? time).split(":");
      const stringsUpdate = {
        year: partialUpdate.year ?? year,
        month: partialUpdate.month ?? month,
        day: partialUpdate.day ?? day,
        hour,
        minute,
        second,
        millisecond: 0
      };
      const update = Object.entries(stringsUpdate).reduce<Temporal.ZonedDateTimeLike>((acc, [key, value]) => {
        // @ts-expect-error
        acc[key] = Number.parseInt(value || '0');
        return acc;
      }, { timeZone });
      const zdt = Temporal.ZonedDateTime.from(update);
      const instant = zdt.toInstant();
      const dateTimeString = zdtToDateTimeString(zdt, precision);
      const timestamp = instantToTimestamp(instant, precision);

      updateState({
        ...partialUpdate,
        timestamp,
        dateTimeString
      })
    } catch (error) {
      console.warn(error);
      updateState(partialUpdate);
    }
  }

  const updateDateTimeString = function(dateTimeString: string) {
    try {
      const instant = Temporal.Instant.from(dateTimeString);
      const zdt = instant.toZonedDateTimeISO(timeZone);
      const timestamp = instantToTimestamp(instant, precision);
      const pickerStrings = zdtToPickerStrings(zdt);

      updateState({
        dateTimeString,
        timestamp,
        ...pickerStrings
      });
    } catch (error) {
      console.warn(error)
      updateState({ dateTimeString });
    }
  }

  const updatePrecision = function(precision: Precision) {
    const timestampLength = precisionMap[precision];
    const roundedTimestamp = timestamp.padEnd(timestampLength, "0").slice(0, timestampLength);
    const instant = timestampToInstant(roundedTimestamp);
    const zdt = instant.toZonedDateTimeISO(timeZone);
    const dateTimeString = zdtToDateTimeString(zdt, precision);
    const pickerStrings = zdtToPickerStrings(zdt);

    updateState({
      precision,
      timestamp: roundedTimestamp,
      dateTimeString,
      ...pickerStrings
    })
  };

  const updateTimeZone = function(timeZone: string) {
    const timestampLength = precisionMap[precision];
    const roundedTimestamp = timestamp.padEnd(timestampLength, "0").slice(0, timestampLength);
    const instant = timestampToInstant(roundedTimestamp);
    const zdt = instant.toZonedDateTimeISO(timeZone);
    const dateTimeString = zdtToDateTimeString(zdt, precision);
    const pickerStrings = zdtToPickerStrings(zdt);

    updateState({
      timeZone,
      timestamp: roundedTimestamp,
      dateTimeString,
      ...pickerStrings
    })
  };

  return <>
    <section>
      <h2>Time and date time conversion</h2>
    </section>
    <h3>Timestamp</h3>
    <section>
      <InputText
        value={timestamp}
        onChange={updateTimestamp}
      />
    </section>
    <h3>Date-time picker</h3>
    <section>
      <span>Year</span>
      <InputText
        maxSize={4}
        value={year}
        onChange={(year) => updatePicker({ year })}
      />
      <span>Month</span>
      <InputText
        maxSize={2}
        value={month}
        onChange={(month) => updatePicker({ month })}
      />
      <span>Day</span>
      <InputText
        maxSize={2}
        value={day}
        onChange={(day) => updatePicker({ day })}
      />
      <span>Time</span>
      <InputText
        maxSize={8}
        value={time}
        onChange={(time) => updatePicker({ time })}
      />
    </section>
    <h3>Date-time string</h3>
    <section>
      <InputText
        value={dateTimeString}
        onChange={updateDateTimeString}
      />
    </section>
    <h3>Settings</h3>
    <section>
      <span>Precision</span>
      <InputSelect options={precisions} value={precision} onChange={updatePrecision} />
      <span>Timezone</span>
      <InputSelect options={timeZones} value={timeZone} onChange={updateTimeZone} />
    </section>
  </>
}
