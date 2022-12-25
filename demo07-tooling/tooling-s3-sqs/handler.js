module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'teste testando',
      },
      null,
      2
    ),
  };
};
