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
  FormText
} from 'reactstrap';

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
    .max(50)
    .required(),
  zip: Yup.string()
    .label('First Name')
    .max(10)
    .matches(/\d{5}(-\d{4})?/)
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
      <FormText color="danger">{touched && errors && errors[field.name]}</FormText>
    </FormGroup>
  );

const initialValues = {
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
    return (
      <Formik
        validationSchema={FormSchema}
        initialValues={initialValues}
        onSubmit={this.submit}>
        {({
          handleSubmit,
          isSubmitting
        }) => (
            <Form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  Register
                </CardHeader>
                <CardBody>
                  <Row form>
                    <Col md={6}>
                      <Field component={InputField} type="text" id="firstName" name="firstName" label="First Name" />
                    </Col>
                    <Col md={6}>
                      <Field component={InputField} type="text" id="lastName" name="lastName" label="Last Name" />
                    </Col>
                  </Row>
                  <Row form>
                    <Col md={12}>
                      <Field component={InputField} type="text" id="npi" name="npi" label="NPI Number" />
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
                      <Field component={InputField} type="text" id="state" name="state" label="State" />
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
                  <Button type="submit" color="primary" disabled={isSubmitting}>Submit</Button>
                </CardFooter>
              </Card>
            </Form>
          )}
      </Formik>
    )
  }
}

export default RegisterForm;
