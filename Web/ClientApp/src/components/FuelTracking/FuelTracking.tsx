import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { ApplicationState } from '../../store';
import * as FuelTrackingRecords from '../../store/FuelTrackingRecordsStore';
import TakeFtrPhotoDialog from "./TakeFtrPhotoDialog";
import RecordFuelTrackingTable from "./RecordFuelTrackingTable";

// At runtime, Redux will merge together...
type FuelTrackingProps =
    FuelTrackingRecords.FuelTrackingRecordsState // ... state we've requested from the Redux store
    & typeof FuelTrackingRecords.actionCreators // ... plus action creators we've requested
    & RouteComponentProps<{ starIndex: string, pageSize: string }>; // ... plus incoming routing parameters

class FuelTracking extends React.PureComponent<FuelTrackingProps> {
  // This method is called when the component is first added to the document
  public componentDidMount() {
    this.ensureDataFetched();
  }

  // This method is called when the route parameters change
  public componentDidUpdate() {
    this.ensureDataFetched();
  }

  public render() {
    return (
        <React.Fragment>
          <TakeFtrPhotoDialog/>
          <h1 id="tabelLabel">
            Fuel Tracking
          </h1>
          <RecordFuelTrackingTable/>
        </React.Fragment>
    );
  }

  private ensureDataFetched() {
    const startIndex = parseInt(this.props.match.params.starIndex, 10) || 0;
    const pageSize = parseInt(this.props.match.params.pageSize, 10) || 10;
    this.props.requestFuelTrackingRecords(startIndex, pageSize);
  }
}

export default connect(
    (state: ApplicationState) => state.fuelTrackingRecords, // Selects which state properties are merged into the component's props
    FuelTrackingRecords.actionCreators // Selects which action creators are merged into the component's props
)(FuelTracking as any);
