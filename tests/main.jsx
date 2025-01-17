import React, { useState, useEffect } from 'react'
import { render } from '@testing-library/react'
import FullCalendar from '../dist/main'
import daygridPlugin from '@fullcalendar/daygrid'


const NOW_DATE = new Date()
const DEFAULT_OPTIONS = {
  plugins: [daygridPlugin]
}


it('should render without crashing', () => {
  let { container } = render(
    <FullCalendar {...DEFAULT_OPTIONS} />
  )
  expect(getHeaderToolbarEl(container)).toBeTruthy()
})


it('should unmount and destroy', () => {
  let unmountCalled = false

  let { unmount } = render(
    <FullCalendar
      {...DEFAULT_OPTIONS}
      viewWillUnmount={() => {
        unmountCalled = true
      }}
    />
  )

  unmount()
  expect(unmountCalled).toBe(true)
})


it('should have updatable props', () => {
  let { container, rerender } = render(
    <FullCalendar {...DEFAULT_OPTIONS} />
  )
  expect(isWeekendsRendered(container)).toBe(true)

  rerender(
    <FullCalendar {...DEFAULT_OPTIONS} weekends={false} />
  )
  expect(isWeekendsRendered(container)).toBe(false)
})


it('should accept a callback', () => {
  let mountCalled = false

  render(
    <FullCalendar
      {...DEFAULT_OPTIONS}
      viewDidMount={() => {
        mountCalled = true
      }}
    />
  )
  expect(mountCalled).toBe(true)
})


it('should expose an API', function() {
  let componentRef = React.createRef()
  render(
    <FullCalendar {...DEFAULT_OPTIONS} ref={componentRef} />
  )

  let calendarApi = componentRef.current.getApi()
  expect(calendarApi).toBeTruthy()

  let newDate = new Date(Date.UTC(2000, 0, 1))
  calendarApi.gotoDate(newDate)
  expect(calendarApi.getDate().valueOf()).toBe(newDate.valueOf())
})


it('won\'t rerender toolbar if didn\'t change', function() { // works because internal VDOM reuses toolbar element
  let { container, rerender } = render(
    <FullCalendar {...DEFAULT_OPTIONS} headerToolbar={buildToolbar()} />
  )
  let headerEl = getHeaderToolbarEl(container)

  rerender(
    <FullCalendar {...DEFAULT_OPTIONS} headerToolbar={buildToolbar()} />
  )
  expect(getHeaderToolbarEl(container)).toBe(headerEl)
})


it('won\'t rerender events if nothing changed', function() {
  let options = {
    ...DEFAULT_OPTIONS,
    events: [buildEvent()]
  }

  let { container, rerender } = render(
    <FullCalendar {...options} />
  )
  let eventEl = getFirstEventEl(container)

  rerender(
    <FullCalendar {...options} />
  )
  expect(getFirstEventEl(container)).toBe(eventEl)
})


// https://github.com/fullcalendar/fullcalendar-react/issues/185
it('will not inifinitely recurse in strict mode with datesSet', function(done) {
  function TestApp() {
    const [events, setEvents] = useState([
      { title: 'event 1', date: '2022-04-01' },
      { title: 'event 2', date: '2022-04-02' }
    ]);

    const dateChange = () => {
      setEvents([
        { title: 'event 10', date: '2022-04-01' },
        { title: 'event 20', date: '2022-04-02' }
      ]);
    };

    useEffect(() => {
      setTimeout(done, 100)
    });

    return (
      <FullCalendar
        plugins={[daygridPlugin]}
        initialView='dayGridMonth'
        events={events}
        datesSet={dateChange}
      />
    );
  }

  render(
    <React.StrictMode>
      <TestApp />
    </React.StrictMode>
  )
})


// https://github.com/fullcalendar/fullcalendar-react/issues/13
it('will not inifinitely recurse with datesSet and dateIncrement', function(done) {
  function TestApp() {
    const [events, setEvents] = useState([
      { title: 'event 1', date: '2022-04-01' },
      { title: 'event 2', date: '2022-04-02' }
    ]);

    const dateChange = () => {
      setEvents([
        { title: 'event 10', date: '2022-04-01' },
        { title: 'event 20', date: '2022-04-02' }
      ]);
    };

    useEffect(() => {
      setTimeout(done, 100)
    });

    return (
      <FullCalendar
        plugins={[daygridPlugin]}
        views={{
          rollingSevenDay: {
            type: 'dayGrid',
            duration: { days: 7 },
            dateIncrement: { days: 1 },
          }
        }}
        initialView='rollingSevenDay'
        events={events}
        datesSet={dateChange}
      />
    );
  }

  render(
    <TestApp />
  )
})


// FullCalendar data utils


function buildToolbar() {
  return {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
  }
}


function buildEvent() {
  return { title: 'event', start: new Date(NOW_DATE.valueOf()) } // consistent datetime
}


// DOM utils


function getHeaderToolbarEl(container) {
  return container.querySelector('.fc-header-toolbar')
}


function isWeekendsRendered(container) {
  return Boolean(container.querySelector('.fc-day-sat'))
}


function getFirstEventEl(container) {
  return container.querySelector('.fc-event')
}
