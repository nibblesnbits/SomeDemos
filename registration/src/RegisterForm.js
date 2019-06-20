import React from 'react';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import {
  Col,
  Row,
  Input,
  Label,
  FormGroup,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Form,
  FormText,
  InputGroup,
  InputGroupAddon,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import states from './states';

const luhnCheck = (input) => {
  const [checkDigit, ...sumDigits] = input.split('').reverse().map(d => Number(d));
  const checkSum = sumDigits.reduce((a, c, i) => {
    if (i % 2 === 0) {
      const double = c * 2;
      if (double > 9) {
        return a + (double - 9);
      }
      return a + double;
    }
    return a + c;
  }, checkDigit);

  return checkSum % 10 === 0;
}

// this returns a formal function because we need to bind() it later
const makeNpiValidationPromise = (npi) => function (rs, rj) {
  const valid = luhnCheck(`80840${npi}`);
  if (!valid) {
    rj(this.createError({ path: this.path, message: 'This is not a valid NPI number' }));
  }
  rs({});
};

const FormSchema = Yup.object().shape({
  firstName: Yup.string()
    .label('First Name')
    .max(150)
    .required(),
  lastName: Yup.string()
    .label('Last Name')
    .max(150)
    .required(),
  npi: Yup.string()
    .label('NPI Number')
    .max(10)
    // this is a formal function so 'this' can be set properly by yup
    .test('validVin', '', function npiTest(vin) {
      return new Promise(makeNpiValidationPromise(vin).bind(this));
    })
    .required(),
  address1: Yup.string()
    .label('Address Line 1')
    .max(150)
    .required(),
  address2: Yup.string()
    .label('Address Line 2')
    .max(150),
  city: Yup.string()
    .label('City')
    .max(50)
    .required(),
  state: Yup.string()
    .label('State')
    .max(2)
    .required(),
  zip: Yup.string()
    .label('Zip Code')
    .max(10)
    .matches(/\d{5}(\d{4})?/)
    .required(),
  phone: Yup.string()
    .label('Phone Number')
    .max(10)
    .matches(/\d{10}/)
    .required(),
  email: Yup.string()
    .label('Email Address')
    .max(150)
    .email()
    .required(),
});

const InputField = ({
  field,
  form: { touched, errors },
  ...props
}) => (
    <FormGroup>
      <Label for={field.id}>{props.label}</Label>
      <Input {...field} {...props} />
      <FormText color="danger">{touched[field.name] && errors[field.name]}</FormText>
    </FormGroup>
  );

const AddressModal = ({ orgs, selectAddress, close }) => {
  return (
    <Modal isOpen={true}>
      <ModalHeader>Choose Address</ModalHeader>
      <ModalBody>
        <ul>
          {orgs.map(o => (
            <li key={o.number}>
              <h4>{o.basic.name}</h4>
              <ul>
                {o.addresses.map((a, i) => (
                  <li key={i}>
                    <Button color="link" onClick={() => selectAddress(a)}>
                      {`${a.address_1} ${a.city}, ${a.state} ${a.postal_code}`}
                    </Button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={close}>Cancel</Button>
      </ModalFooter>
    </Modal>
  );
}

class NpiInputBox extends React.Component {
  constructor() {
    super();
    this.state = {
      searching: false,
      orgList: [],
    };
    this.getAddressFromNpi = this.getAddressFromNpi.bind(this);
    this.selectAddress = this.selectAddress.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  getAddressFromNpi(npi) {
    // for this to work, run `node server.js` at the root of this project
    this.setState({
      searching: true,
    });
    fetch(`http://localhost:3001/npi/${npi}`)
      .then(resp => {
        resp.json().then(data => {
          debugger;
          this.setState({
            searching: false,
            orgList: data.results,
          });
        });
      }).catch(() => {
        this.setState({
          searching: false,
          orgList: [],
        });
      });
  }

  selectAddress(setValues, values) {
    return (address) => {
      setValues({
        ...values,
        address1: address.address_1,
        address2: address.address_2,
        city: address.city,
        state: address.state,
        zip: address.postal_code.substring(0, 5),
        phone: address.telephone_number.replace(/-/gi, ''),
      });
      this.setState({
        searching: false,
        orgList: [],
      });
    };
  }

  closeModal() {
    this.setState({
      orgList: [],
    });
  }

  render() {
    const {
      field,
      form: { touched, errors, values, setValues },
      ...props
    } = this.props;
    return (
      <React.Fragment>
        <InputGroup>
          <Label for={props.id}>{props.label}</Label>
          <span className="w-100"></span>
          <Input {...field} {...props} />
          <InputGroupAddon addonType="append">
            <Button color="primary" disabled={this.state.searching || !!errors[field.name]}
              onClick={() => this.getAddressFromNpi(values.npi, setValues, values)}>
              {this.state.searching ? "Searching..." : "Search"}
            </Button>
          </InputGroupAddon>
          <span className="w-100"></span>
          <FormText color="danger">{touched[field.name] && errors[field.name]}</FormText>
        </InputGroup>
        {this.state.orgList.length > 0 &&
          <AddressModal
            orgs={this.state.orgList}
            selectAddress={this.selectAddress(setValues, values)}
            close={this.closeModal} />
        }
      </React.Fragment>
    );
  }
}

const initialValues = {
  id: 0,
  firstName: '',
  lastName: '',
  npi: '1043328156',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
  email: '',
};

class RegisterForm extends React.Component {
  constructor() {
    super();
    this.submit = this.submit.bind(this);
  }

  submit(vals, actions) {
    this.props.addEntry(vals);
    actions.setSubmitting(false);
    actions.resetForm(initialValues);
  }

  render() {
    const { entry } = this.props;
    return (
      <Formik
        enableReinitialize
        validationSchema={FormSchema}
        initialValues={entry || initialValues}
        onSubmit={this.submit}>
        {({
          handleSubmit,
          isSubmitting,
          resetForm
        }) => (
            <Form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  Register
                </CardHeader>
                <CardBody>
                  <Row form>
                    <Field id="id" name="id" type="hidden" />
                    <Col md={6}>
                      <Field component={InputField} type="text" id="firstName" name="firstName" label="First Name" />
                    </Col>
                    <Col md={6}>
                      <Field component={InputField} type="text" id="lastName" name="lastName" label="Last Name" />
                    </Col>
                  </Row>
                  <Row form>
                    <Col md={12}>
                      <Field component={NpiInputBox} type="text" id="npi" name="npi" label="NPI Number" />
                    </Col>
                  </Row>
                  <Row form>
                    <Col md={12}>
                      <Field component={InputField} type="text" id="address1" name="address1" label="Address Line 1" />
                    </Col>
                  </Row>
                  <Row form>
                    <Col md={12}>
                      <Field component={InputField} type="text" id="address2" name="address2" label="Address Line 2" />
                    </Col>
                  </Row>
                  <Row form>
                    <Col md={4}>
                      <Field component={InputField} type="text" id="city" name="city" label="City" />
                    </Col>
                    <Col md={4}>
                      <Field component={InputField} type="select" id="state" name="state" label="State">
                        <option value="">Select One</option>
                        {Object.entries(states).map(e => (<option key={e[1]} value={e[1]}>{e[0]}</option>))}
                      </Field>
                    </Col>
                    <Col md={4}>
                      <Field component={InputField} type="text" id="zip" name="zip" label="Zip Code" />
                    </Col>
                  </Row>
                  <Row form>
                    <Col md={6}>
                      <Field component={InputField} type="phone" id="phone" name="phone" label="Telephone Number" />
                    </Col>
                    <Col md={6}>
                      <Field component={InputField} type="email" id="email" name="email" label="Email Address" />
                    </Col>
                  </Row>
                </CardBody>
                <CardFooter>
                  <Button type="submit" color="primary" disabled={isSubmitting}>
                    {entry ? "Save" : "Submit"}
                  </Button>
                  <Button color="secondary" disabled={isSubmitting} onClick={() => resetForm(initialValues)}>
                    {entry ? "Cancel" : "Clear"}
                  </Button>
                </CardFooter>
              </Card>
            </Form>
          )}
      </Formik>
    )
  }
}

export default RegisterForm;
