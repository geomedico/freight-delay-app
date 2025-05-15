'use client';

import DataGrid, {
  Column,
  type DataGridTypes,
  MasterDetail,
  Selection,
} from 'devextreme-react/data-grid';
import TrafficMap from '@/components/TrafficMap';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { employees } from './data';

const onContentReady = (e: DataGridTypes.ContentReadyEvent) => {
  if (!e.component.getSelectedRowKeys().length) { e.component.selectRowsByIndexes([0]); }
};

const onSelectionChanged = (e: DataGridTypes.SelectionChangedEvent) => {
  e.component.collapseAll(-1);
  e.component.expandRow(e.currentSelectedRowKeys[0]);
};

const renderDetail = (props: DataGridTypes.MasterDetailTemplateData) => {
  const { Origin, Destination, WA } = props.data;
  return (
    <div className="route-info">
      <TrafficMap
        origin={Origin}
        destination={Destination}
        contact={WA} />
    </div>
  );
};

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <DataGrid
          id="grid-container"
          dataSource={employees}
          keyExpr="ID"
          onSelectionChanged={onSelectionChanged}
          onContentReady={onContentReady}
          showBorders={true}
        >
          <Selection mode="single" />
          <Column dataField="Prefix" width={70} caption="Title" />
          <Column dataField="FirstName" width={120} />
          <Column dataField="LastName" width={120} />
          <Column dataField="BirthDate" dataType="date" width={150} />
          <Column dataField="Origin" width={120} />
          <Column dataField="Destination" width={120} />
          <Column dataField="CargoType" width={150} caption="Cargo type" />
          <Column dataField="CargoDescription" width={200} caption="Cargo description" />
          <MasterDetail enabled={false} render={renderDetail} />
        </DataGrid>
      </main>
      <Footer />
    </div>
  );
}
