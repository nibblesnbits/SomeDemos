import React from 'react';
import RegisterForm from './RegisterForm';
import {
  Button,
  Table,
  Row,
  Col
} from 'reactstrap';


const EntryList = ({ list, deleteEntry, editEntry }) => (
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
            <td><a target="blank" href={`https://npiregistry.cms.hhs.gov/registry/provider-view/${e.npi}`}>{e.npi}</a></td>
            <td>{`${e.city}, ${e.state}`}</td>
            <td>
              <Button color="primary" onClick={() => editEntry(e)}>&#9998;</Button>
              <Button color="danger" onClick={() => deleteEntry(e.id)}>&times;</Button>
            </td>
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
    this.edit = this.edit.bind(this);
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

  edit(entry) {
    this.setState({
      list: [...this.state.list.filter(i => i.id !== entry.id)],
      editEntry: entry,
    });
  }

  addEntry(entry) {
    /*
      This bit is a little hokey.
      I'm re-assigning all entries a new Id every time
      so I don't end up with conflicts.  Not really realistic.
    */
    this.setState({
      list: [
        ...this.state.list.map((e, i) => ({ ...e, id: i })),
        { ...entry, id: this.state.list.length + 1 }
      ],
      editEntry: undefined,
    });
  }

  render() {
    return (
      <Row>
        <Col md={6}><RegisterForm addEntry={this.addEntry} entry={this.state.editEntry} /></Col>
        <Col md={6}><EntryList list={this.state.list} deleteEntry={this.delete} editEntry={this.edit} /></Col>
      </Row>
    )
  }
}

export default RegistrationPage;
