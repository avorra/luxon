/* global test expect */
import { DateTime, Interval, Duration } from '../../dist/cjs/luxon';

const fromISOs = (s, e) => DateTime.fromISO(s).until(DateTime.fromISO(e)),
  todayAt = h => DateTime.local().startOf('day').hour(h);

//------
// #length()
//-------
test('Interval#length defaults to milliseconds', () => {
  const n = DateTime.local(), d = n.until(n.plus(1, 'minute'));
  expect(d.length()).toBe(60 * 1000);
});

test("Interval#length('days') returns 1 for yesterday", () => {
  expect(todayAt(13).minus(1, 'day').until(todayAt(13)).length('days')).toBe(1);
});

test("Interval#length('months') returns the right number of months", () => {
  expect(Math.floor(fromISOs('1996-02-17', '2012-08-14').length('months'))).toBe(197);
});

test("Interval#length('years') returns the right number of years", () => {
  expect(Math.floor(fromISOs('1996-02-17', '2012-08-14').length('years'))).toBe(16);
});

//------
// #count()
//-------
test("Interval#count('days') returns 1 inside a day", () => {
  const i = DateTime.fromISO('2016-05-25T03:00').until(DateTime.fromISO('2016-05-25T14:00'));
  expect(i.count('days')).toBe(1);
});

test("Interval#count('days') returns 2 if the interval crosses midnight", () => {
  const i = DateTime.fromISO('2016-05-25T03:00').until(DateTime.fromISO('2016-05-26T14:00'));
  expect(i.count('days')).toBe(2);
});

test("Interval#count('years') returns 1 inside a year", () => {
  const i = DateTime.fromISO('2016-05-25').until(DateTime.fromISO('2016-05-26'));
  expect(i.count('years')).toBe(1);
});

test("Interval#count('days') returns 2 if the interval crosses the new year", () => {
  const i = DateTime.fromISO('2016-05-25').until(DateTime.fromISO('2017-05-26'));
  expect(i.count('years')).toBe(2);
});

//------
// #toDuration()
//-------
test('Interval#toDuration(units) creates a duration in those units', () => {
  const int = Interval.fromDateTimes(todayAt(9), todayAt(13));

  expect(int.toDuration().equals(Duration.fromLength(4 * 3600 * 1000))).toBeTruthy();
  expect(int.toDuration('milliseconds').equals(Duration.fromLength(4 * 3600 * 1000))).toBeTruthy();
  expect(int.toDuration('seconds').equals(Duration.fromLength(4 * 3600, 'seconds'))).toBeTruthy();
  expect(int.toDuration('minutes').equals(Duration.fromLength(4 * 60, 'minutes'))).toBeTruthy();
  expect(int.toDuration('hours').equals(Duration.fromLength(4, 'hours'))).toBeTruthy();
  expect(int.toDuration('days').equals(Duration.fromLength(1 / 6, 'days'))).toBeTruthy();
  expect(int.toDuration('weeks').equals(Duration.fromLength(1 / (6 * 7), 'weeks'))).toBeTruthy();
});

//------
// #contains()
//-------
test('Interval#contains returns true for DateTimes in the interval', () => {
  const i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
  expect(i.contains(DateTime.fromISO('1982-05-25T06:30'))).toBeTruthy();
});

test('Interval#contains returns false for DateTimes after the interval', () => {
  const i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
  expect(i.contains(DateTime.fromISO('1982-05-25T08:30'))).toBeFalsy();
});

test('Interval#contains returns false for DateTimes before the interval', () => {
  const i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
  expect(i.contains(DateTime.fromISO('1982-05-25T05:30'))).toBeFalsy();
});

test('Interval#contains returns true for the start endpoint', () => {
  const i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
  expect(i.contains(DateTime.fromISO('1982-05-25T06:00'))).toBeTruthy();
});

test('Interval#contains returns false for the end endpoint', () => {
  const i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
  expect(i.contains(DateTime.fromISO('1982-05-25T07:00'))).toBeFalsy();
});

//------
// #isEmpty()
//-------
test('Interval#isEmpty returns true for empty intervals', () => {
  const i = fromISOs('1982-05-25T06:00', '1982-05-25T06:00');
  expect(i.isEmpty()).toBeTruthy();
});

test('Interval#isEmpty returns false for non-empty intervals', () => {
  const i = fromISOs('1982-05-25T06:00', '1982-05-25T08:00');
  expect(i.isEmpty()).toBeFalsy();
});

//------
// #isBefore()
//------
test('Interval#isBefore returns true for intervals fully before the input', () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.fromDateTimes(n.minus(2, 'day'), n.minus(1, 'day'));
  expect(i.isBefore(n)).toBeTruthy();
});

test('Interval#isBefore returns false for intervals containing the input', () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.fromDateTimes(n.minus(2, 'day'), n.plus(2, 'day'));
  expect(i.isBefore(n)).toBeFalsy();
});

test('Interval#isBefore returns false for intervals fully after the input ', () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.fromDateTimes(n.plus(2, 'day'), n.plus(3, 'day'));
  expect(i.isBefore(n)).toBeFalsy();
});

test('Interval#isBefore returns false for intervals starting at the input', () => {
  const n = DateTime.fromISO('1982-05-25T06:00'), i = Interval.fromDateTimes(n.minus(1, 'day'), n);
  expect(i.isBefore(n)).toBeFalsy();
});

//------
// #isAfter()
//-------
test('Interval#isAfter returns true for intervals fully after the input', () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.fromDateTimes(n.plus(1, 'day'), n.plus(2, 'day'));
  expect(i.isAfter(n)).toBeTruthy();
});

test('Interval#isAfter returns false for intervals containing the input', () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.fromDateTimes(n.minus(2, 'day'), n.plus(2, 'day'));
  expect(i.isAfter(n)).toBeFalsy();
});

test('Interval#isAfter returns false for fully before the input ', () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.fromDateTimes(n.minus(2, 'day'), n.minus(1, 'day'));
  expect(i.isAfter(n)).toBeFalsy();
});

test('Interval#isAfter returns false for intervals beginning at the input', () => {
  const n = DateTime.fromISO('1982-05-25T06:00'), i = Interval.fromDateTimes(n, n.plus(1, 'day'));
  expect(i.isAfter(n)).toBeFalsy();
});

//------
// #hasSame()
//-------
test("Interval#hasSame('day') returns true for durations on the same day", () => {
  const n = DateTime.fromISO('1982-05-25T06:00'), i = Interval.fromDateTimes(n, n.plus(5, 'hours'));
  expect(i.hasSame('day')).toBeTruthy();
});

test("Interval#hasSame('day') returns true for durations that last until the next day", () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.fromDateTimes(n, n.plus(20, 'hours'));
  expect(i.hasSame('day')).toBeFalsy();
});

test("Interval#hasSame('day') returns true for durations durations ending at midnight", () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.fromDateTimes(n, n.plus(1, 'day').startOf('day'));
  expect(i.hasSame('day')).toBeTruthy();
});

//------
// locale
//------
test('Interval#locale() returns the locale', () => {
  const dt = DateTime.local().locale('be'), i = Interval.after(dt, 1, 'day');
  expect(i.locale()).toBe('be');
});