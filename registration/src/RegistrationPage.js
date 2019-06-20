import React from 'react';
import RegisterForm from './RegisterForm';
import {
  Button,
  Table,
} from 'reactstrap';


const EntryList = ({ list, deleteEntry }) => (
  <div>
    <h3>Entry List</h3>
    <Table>
      <thead>
        <tr>
          <th>Name</th>
          <th>NPI Number</th>
          <th>Location</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {list.map(e => (
          <tr key={e.id}>
            <td>{`${e.firstName} ${e.lastName}`}</td>
            <td>{e.npi}</td>
            <td>{`${e.city}, ${e.state}`}</td>
            <td><Button color="danger" onClick={() => deleteEntry(e.id)}>&times;</Button></td>
          </tr>
        ))}
      </tbody>
    </Table>
  </div>
)

class RegistrationPage extends React.Component {
  constructor() {
    super();
    this.delete = this.delete.bind(this);
    this.addEntry = this.addEntry.bind(this);
    this.state = {
      list: [],
    };
  }

  delete(id) {
    this.setState({
      list: [...this.state.list.filter(i => i.id !== id)]
    });
  }

  addEntry(entry) {
    this.setState({
      list: [
        ...this.state.list.map((e, i) => ({...e, id: i})),
        { ...entry, id: this.state.list.length + 1 }
      ]
    });
  }

  render() {
    return (
      <div>
        <RegisterForm addEntry={this.addEntry}/>
        {this.state.list.length > 0 &&
          <EntryList list={this.state.list} deleteEntry={this.delete} />
        }
      </div>
    )
  }
}

export default RegistrationPage;
